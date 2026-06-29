export type ChatMessage = {
  from: "me" | "them";
  text: string;
  time: string;
};

export type Conversation = {
  id: string;
  name: string;
  role: string;
  preview: string;
  time: string;
  status: string;
  context?: string[];
  unread?: number;
  messages: ChatMessage[];
};

function flipPerspective(messages: ChatMessage[]): ChatMessage[] {
  return messages.map((message) => ({
    ...message,
    from: message.from === "me" ? "them" : "me",
  }));
}

export const homeownerConversations: Conversation[] = [
  {
    id: "cabinet",
    name: "Cabinet repair",
    role: "Handyman lead",
    preview: "I can stop by tomorrow morning.",
    time: "9:42 AM",
    status: "Usually replies in a few minutes",
    unread: 1,
    messages: [
      { from: "them", text: "I saw the cabinet photos. I can stop by tomorrow morning.", time: "9:38 AM" },
      { from: "me", text: "That works. Do you need any other details?", time: "9:40 AM" },
      { from: "them", text: "A rough height and whether the hinge is loose would help.", time: "9:42 AM" },
    ],
  },
  {
    id: "sink",
    name: "Kitchen sink leak",
    role: "Plumbing lead",
    preview: "Please send one photo under the sink.",
    time: "Yesterday",
    status: "Reply expected today",
    messages: [
      { from: "them", text: "Please send one photo under the sink so I can see the valve.", time: "Yesterday" },
      { from: "me", text: "I will add it to the job post.", time: "Yesterday" },
    ],
  },
  {
    id: "drywall",
    name: "Drywall patch",
    role: "Repair quote",
    preview: "I can give a range after seeing the size.",
    time: "Mon",
    status: "Waiting for details",
    messages: [
      { from: "them", text: "I can give a range after seeing the size.", time: "Mon" },
      { from: "me", text: "It is about the size of a dinner plate.", time: "Mon" },
    ],
  },
];

export const workerConversations: Conversation[] = homeownerConversations.map((conversation) => ({
  ...conversation,
  role: "Homeowner lead",
  status: conversation.status === "Waiting for details" ? "Waiting on homeowner" : "Lead conversation",
  context:
    conversation.id === "cabinet"
      ? ["Handyman", "Homeowner reply", "Tomorrow morning"]
      : conversation.id === "sink"
        ? ["Plumbing", "Needs photo", "Reply expected today"]
        : ["Home repair", "Quote requested", "Waiting for details"],
  messages: flipPerspective(conversation.messages),
}));

export const conversations = homeownerConversations;

export function isWorkerRole(role?: string) {
  return role === "contractor" || role === "admin";
}

export function getConversationsForRole(role?: string) {
  return isWorkerRole(role) ? workerConversations : homeownerConversations;
}

export function chatInitial(name: string) {
  return (name.trim().charAt(0) || "?").toUpperCase();
}
