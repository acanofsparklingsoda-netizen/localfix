"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";
import { ArrowLeftIcon, MessageIcon, SearchIcon, SendIcon, XIcon } from "./Icons";
import { chatInitial, getConversationsForRole, homeownerConversations, isWorkerRole } from "@/lib/chat-data";

export function ChatWidget() {
  const pathname = usePathname();
  const normalizedPath = pathname.replace(/\/$/, "") || "/";
  const { user } = useAuth();
  const isWorkerView = isWorkerRole(user?.role);
  const conversations = getConversationsForRole(user?.role);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"inbox" | "thread">("inbox");
  const [activeId, setActiveId] = useState(homeownerConversations[0].id);
  const signedIn = !!user;

  useEffect(() => {
    setActiveId(conversations[0].id);
    setView("inbox");
  }, [isWorkerView, conversations]);

  if (normalizedPath === "/chats" || normalizedPath === "/login" || normalizedPath === "/signup") return null;

  const active = conversations.find((item) => item.id === activeId) || conversations[0];
  const totalUnread = conversations.reduce((sum, item) => sum + (item.unread || 0), 0);

  function openThread(id: string) {
    setActiveId(id);
    setView("thread");
  }

  return (
    <div className="lf-chat-widget">
      {open ? (
        <section className="lf-chat-pop" aria-label="Messages">
          {signedIn ? (
            view === "thread" ? (
              <>
                <div className="lf-chat-pop-head lf-chat-pop-head--thread">
                  <button type="button" aria-label="Back to inbox" onClick={() => setView("inbox")}>
                    <ArrowLeftIcon />
                  </button>
                  <span className="lf-chat-avatar lf-chat-avatar--sm">{chatInitial(active.name)}</span>
                  <div>
                    <strong>{active.name}</strong>
                    <span>{isWorkerView ? active.role : active.status}</span>
                  </div>
                  <button type="button" aria-label="Close messages" onClick={() => setOpen(false)}>
                    <XIcon />
                  </button>
                </div>
                <div className="lf-chat-mini-thread">
                  {active.messages.map((message, index) => (
                    <div className={`lf-chat-bubble-row${message.from === "me" ? " is-me" : ""}`} key={`${active.id}-${index}`}>
                      <p>{message.text}</p>
                      <time>{message.time}</time>
                    </div>
                  ))}
                </div>
                <div className="lf-chat-mini-compose">
                  <input aria-label="Message" placeholder="Message..." />
                  <button type="button" aria-label="Send message">
                    <SendIcon />
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="lf-chat-pop-head">
                  <div>
                    <strong>{isWorkerView ? "Lead inbox" : "Messages"}</strong>
                    <span>{totalUnread ? `${totalUnread} new ${isWorkerView ? "lead reply" : "reply"}` : isWorkerView ? "Recent leads" : "Recent conversations"}</span>
                  </div>
                  <button type="button" aria-label="Close messages" onClick={() => setOpen(false)}>
                    <XIcon />
                  </button>
                </div>
                <div className="lf-chat-search">
                  <SearchIcon />
                  <span>{isWorkerView ? "Search leads" : "Search messages"}</span>
                </div>
                <div className="lf-chat-mini-list">
                  {conversations.map((item) => (
                    <button className={active.id === item.id ? "is-active" : undefined} key={item.id} type="button" onClick={() => openThread(item.id)}>
                      <span className="lf-chat-avatar lf-chat-avatar--sm">{chatInitial(item.name)}</span>
                      <span className="lf-chat-row-text">
                        <strong>{item.name}</strong>
                        <small>{item.preview}</small>
                      </span>
                      <span className="lf-chat-row-meta">
                        <time>{item.time}</time>
                        {item.unread ? <b>{item.unread}</b> : null}
                      </span>
                    </button>
                  ))}
                </div>
                <Link className="lf-chat-viewmore" href="/chats">
                  See all messages
                </Link>
              </>
            )
          ) : (
            <div className="lf-chat-login">
              <div className="lf-chat-login-mark">
                <MessageIcon />
              </div>
              <h2>Log in to see messages</h2>
              <p>Replies from workers and homeowners will show here.</p>
              <Link className="btn btn-primary" href="/login?next=/chats">
                Log in
              </Link>
            </div>
          )}
        </section>
      ) : null}

      <button className="lf-chat-fab" type="button" aria-label="Open messages" onClick={() => setOpen((value) => !value)}>
        <MessageIcon />
        {signedIn && totalUnread ? <span>{totalUnread}</span> : null}
      </button>
    </div>
  );
}
