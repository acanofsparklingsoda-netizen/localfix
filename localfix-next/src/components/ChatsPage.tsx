"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { RoleAppHeader } from "./AccountChrome";
import { useAuth } from "./AuthProvider";
import { BodyClass } from "./BodyClass";
import { MessageIcon, SearchIcon, SendIcon } from "./Icons";
import { SiteHeader } from "./SiteShell";
import { getSupabase, supabaseConfigured } from "@/lib/supabase";
import { chatInitial, getConversationsForRole, homeownerConversations, isWorkerRole } from "@/lib/chat-data";

export function ChatsPage() {
  const router = useRouter();
  const { ready: authReady, user } = useAuth();
  const [status, setStatus] = useState("Loading messages...");
  const isWorkerView = isWorkerRole(user?.role);
  const conversations = getConversationsForRole(user?.role);
  const [activeId, setActiveId] = useState(homeownerConversations[0].id);
  const active = conversations.find((item) => item.id === activeId) || conversations[0];

  useEffect(() => {
    if (!supabaseConfigured) {
      setStatus("Sign-in is not configured yet.");
      return;
    }
    setStatus(authReady ? "" : "Loading messages...");
  }, [authReady]);

  useEffect(() => {
    setActiveId(conversations[0].id);
  }, [isWorkerView, conversations]);

  async function logout() {
    await getSupabase().auth.signOut();
    router.push("/");
  }

  return (
    <>
      <BodyClass className="lf-app" />
      {user ? (
        <RoleAppHeader user={user} activeHref="/chats" onLogout={logout} />
      ) : (
        <SiteHeader active="" />
      )}
      <main className="lf-main lf-main--chats">
        {!user ? (
          <div className="lf-gate">
            <div className="lf-mark">
              <MessageIcon />
            </div>
            <h2>Log in to view messages</h2>
            <p>{status || "Your repair and worker chats will live here."}</p>
            <Link className="btn btn-primary btn-lg" href="/login?next=/chats">
              Log in
            </Link>
          </div>
        ) : (
          <>
            <section className={`lf-chat-page${isWorkerView ? " lf-chat-page--worker" : ""}`} aria-label={isWorkerView ? "Worker chats" : "Chats"}>
              <aside className="lf-chat-list" aria-label="Conversations">
                <div className="lf-chat-list-head">
                  <h2>{isWorkerView ? "Lead inbox" : "Messages"}</h2>
                  <span>{conversations.length} {isWorkerView ? "active leads" : "conversations"}</span>
                </div>
                <div className="lf-chat-search lf-chat-search--page">
                  <SearchIcon />
                  <span>{isWorkerView ? "Search leads" : "Search messages"}</span>
                </div>
                {conversations.map((conversation) => (
                  <button className={conversation.id === active.id ? "is-active" : undefined} key={conversation.id} type="button" onClick={() => setActiveId(conversation.id)}>
                    <span className="lf-chat-avatar">{chatInitial(conversation.name)}</span>
                    <span className="lf-chat-row-text">
                      <strong>{conversation.name}</strong>
                      <small>{conversation.role}</small>
                      <em>{conversation.preview}</em>
                    </span>
                    <span className="lf-chat-row-meta">
                      <time>{conversation.time}</time>
                      {conversation.unread ? <b>{conversation.unread}</b> : null}
                    </span>
                  </button>
                ))}
              </aside>

              <article className="lf-chat-thread">
                <div className="lf-chat-thread-head">
                  <span className="lf-chat-avatar">{chatInitial(active.name)}</span>
                  <div>
                    <h2>{active.name}</h2>
                    <p>{active.role} · {active.status}</p>
                  </div>
                </div>
                {isWorkerView && active.context?.length ? (
                  <div className="lf-chat-lead-strip" aria-label="Lead details">
                    {active.context.map((item) => (
                      <span key={item}>{item}</span>
                    ))}
                  </div>
                ) : null}
                <div className="lf-chat-messages">
                  {active.messages.map((message, index) => (
                    <div className={`lf-chat-bubble-row${message.from === "me" ? " is-me" : ""}`} key={`${active.id}-${index}`}>
                      <p>{message.text}</p>
                      <time>{message.time}</time>
                    </div>
                  ))}
                </div>
                <div className="lf-chat-compose">
                  <input aria-label="Message" placeholder="Message..." />
                  <button type="button" aria-label="Send message">
                    <SendIcon />
                    <span>Send</span>
                  </button>
                </div>
              </article>
            </section>
          </>
        )}
      </main>
    </>
  );
}
