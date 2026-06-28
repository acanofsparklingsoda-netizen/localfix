<?php
/**
 * Local Fix — Job Submission Handler (Post My Problem form)
 *
 * Pipeline:
 *   1. Origin / referer validation
 *   2. Honeypot field (website_trap)
 *   3. JavaScript token (jsToken)  — proves JS ran
 *   4. Time gate (>= 3s)           — blocks instant bot posts
 *   5. Append the job to Google Sheets (service account -> Sheets API, no Composer)
 *
 * Same Google Sheets method as krushpropertymanagement / burlingtonfurnishedrentals:
 * a Google Cloud SERVICE ACCOUNT signs a JWT (openssl, built into PHP), trades it
 * for an OAuth token, then appends one row via the Sheets REST API. No Apps Script.
 *
 * Drop this file at the SITE ROOT (same folder as post-job.html). The form POSTs
 * JSON to "submit-job.php". Your host must run PHP (e.g. DreamHost) — GitHub Pages
 * cannot run this. credentials.json (the service-account key) sits next to it.
 *
 * ===========================================================================
 *  >>> ONE THING TO FILL IN: paste your Google Sheet id into $spreadsheetId
 *      below, then SHARE that sheet (Editor) with the service-account email:
 *        lead-updater@zync-herimports-f61c3849.iam.gserviceaccount.com
 *      Leave $spreadsheetId blank to skip Sheets logging (form still succeeds).
 * ===========================================================================
 */

ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/php-errors.log');
error_reporting(E_ALL);

// ============================ CONFIG ========================================

// Google Sheets job log.
//   - $spreadsheetId : the long id from the sheet URL (/d/<ID>/edit)
//   - $sheetRange    : tab + anchor cell to append under (e.g. 'Sheet1!A1')
//   - credentials.json (service-account key) must sit next to this file.
//   SHARE the sheet with the service account's client_email (Editor) once.
//   Leave $spreadsheetId blank to skip Sheets logging.
$spreadsheetId = '1-vFITD1vlGZA-WvOnniFKbUn6v-UnmfXI5LKWIx9DG4';
$sheetRange    = 'Sheet1!A1';

// ============================ ORIGIN GUARD ==================================

$allowed_patterns = [
    '/^https?:\/\/([a-z0-9-]+\.)?localfix\.com$/i',
    '/^https?:\/\/([a-z0-9-]+\.)?github\.io$/i',
    '/^https?:\/\/([a-z0-9-]+\.)?dreamhosters\.com$/i',
    '/^https?:\/\/localhost(:\d+)?$/i',
    '/^https?:\/\/127\.0\.0\.1(:\d+)?$/i',
];

$origin  = $_SERVER['HTTP_ORIGIN'] ?? '';
$referer = $_SERVER['HTTP_REFERER'] ?? '';
$is_allowed = false;

if ($origin) {
    foreach ($allowed_patterns as $p) {
        if (preg_match($p, $origin)) { $is_allowed = true; header("Access-Control-Allow-Origin: $origin"); break; }
    }
} elseif ($referer) {
    $host = parse_url($referer, PHP_URL_SCHEME) . '://' . parse_url($referer, PHP_URL_HOST);
    foreach ($allowed_patterns as $p) { if (preg_match($p, $host)) { $is_allowed = true; break; } }
}

header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }
if (!$is_allowed) { http_response_code(403); echo json_encode(['success' => false, 'message' => 'Forbidden origin']); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(['success' => false, 'message' => 'Method not allowed']); exit; }

// ============================ INPUT =========================================

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) { http_response_code(400); echo json_encode(['success' => false, 'message' => 'Invalid input']); exit; }

// ============================ ANTI-BOT ======================================

// Honeypot: hidden field must stay empty (fake success to fool bots)
if (!empty($input['website_trap'])) { echo json_encode(['success' => true, 'message' => 'Thank you']); exit; }

// JS token must be present
if (empty($input['jsToken'])) { http_response_code(400); echo json_encode(['success' => false, 'message' => 'Please enable JavaScript and try again.']); exit; }

// Time gate
$duration = isset($input['formDuration']) ? (int)$input['formDuration'] : 0;
if ($duration < 3000) { http_response_code(400); echo json_encode(['success' => false, 'message' => 'That was a little too quick, please try again.']); exit; }

// ============================ VALIDATE ======================================

$name  = trim((string)($input['name'] ?? ''));
$email = filter_var(trim($input['email'] ?? ''), FILTER_SANITIZE_EMAIL);

if ($name === '' || $email === '') { http_response_code(400); echo json_encode(['success' => false, 'message' => 'Name and email are required.']); exit; }
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) { http_response_code(400); echo json_encode(['success' => false, 'message' => 'Please enter a valid email address.']); exit; }

// ============================ GOOGLE SHEETS =================================
// Service-account write to the Sheets REST API. Signs a JWT with openssl (built
// into PHP), trades it for an OAuth token, then appends one row. No Composer.

function sheets_append($credentialsPath, $spreadsheetId, $range, array $row) {
    if (!file_exists($credentialsPath)) { error_log('Sheets: credentials.json not found'); return false; }
    if (!function_exists('openssl_sign')) { error_log('Sheets: openssl unavailable'); return false; }
    $c = json_decode(file_get_contents($credentialsPath), true);
    if (empty($c['client_email']) || empty($c['private_key'])) { error_log('Sheets: bad credentials.json'); return false; }

    $b64 = function ($d) { return rtrim(strtr(base64_encode($d), '+/', '-_'), '='); };
    $tokenUri = $c['token_uri'] ?? 'https://oauth2.googleapis.com/token';
    $now = time();
    $jwtHeader = $b64(json_encode(['alg' => 'RS256', 'typ' => 'JWT']));
    $jwtClaim  = $b64(json_encode([
        'iss'   => $c['client_email'],
        'scope' => 'https://www.googleapis.com/auth/spreadsheets',
        'aud'   => $tokenUri,
        'iat'   => $now,
        'exp'   => $now + 3600,
    ]));
    $sig = '';
    if (!openssl_sign($jwtHeader . '.' . $jwtClaim, $sig, $c['private_key'], 'SHA256')) { error_log('Sheets: JWT sign failed'); return false; }
    $jwt = $jwtHeader . '.' . $jwtClaim . '.' . $b64($sig);

    // Exchange the signed JWT for an access token
    $ch = curl_init($tokenUri);
    curl_setopt_array($ch, [
        CURLOPT_POST => true, CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 8,
        CURLOPT_POSTFIELDS => http_build_query([
            'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            'assertion'  => $jwt,
        ]),
    ]);
    $tr = curl_exec($ch); $tc = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $tok = json_decode($tr, true);
    if ($tc >= 400 || empty($tok['access_token'])) { error_log("Sheets token error $tc: $tr"); return false; }

    // Append the row
    $url = 'https://sheets.googleapis.com/v4/spreadsheets/' . rawurlencode($spreadsheetId)
         . '/values/' . rawurlencode($range)
         . ':append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS';
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_POST => true, CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 8,
        CURLOPT_HTTPHEADER => ['Authorization: Bearer ' . $tok['access_token'], 'Content-Type: application/json'],
        CURLOPT_POSTFIELDS => json_encode(['values' => [$row]]),
    ]);
    $sr = curl_exec($ch); $sc = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    if ($sc >= 400) { error_log("Sheets append error $sc: $sr"); return false; }
    return true;
}

if (!empty($spreadsheetId)) {
    // Raw (un-escaped) values read straight for the spreadsheet
    $rv = function ($k) use ($input) { return trim((string)($input[$k] ?? '')); };

    // Files can't ride along in JSON — record what the visitor attached, by name.
    $media = '';
    if (!empty($input['media']) && is_array($input['media'])) {
        $media = implode(', ', array_map(function ($m) { return trim((string)$m); }, $input['media']));
    } else {
        $media = $rv('media');
    }

    // Fixed column order. Put a matching header row in row 1 of the sheet:
    // Date | Category | Description | ZIP | Urgency | Name | Phone | Email | Media | Consent | Referer
    $row = [
        date('Y-m-d H:i'),
        $rv('category'),
        $rv('description'),
        $rv('location'),
        $rv('urgency'),
        $name,
        $rv('phone'),
        $email,
        $media,
        !empty($input['consent']) ? 'Yes' : 'No',
        trim($input['referer'] ?? ($_SERVER['HTTP_REFERER'] ?? 'Direct')),
    ];
    sheets_append(__DIR__ . '/credentials.json', $spreadsheetId, $sheetRange, $row);
}

// ============================ DONE ==========================================

echo json_encode(['success' => true, 'message' => 'Your request has been received.']);
