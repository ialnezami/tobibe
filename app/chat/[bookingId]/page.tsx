"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";

interface ChatMessage {
  _id: string;
  senderId: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  receiverId: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface Booking {
  _id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  customerId: {
    _id: string;
    name: string;
    email: string;
  };
  doctorId: {
    _id: string;
    name: string;
    email: string;
  };
}

interface ChatAvailability {
  isAvailable: boolean;
  appointmentDate: string;
  oneHourBefore: string;
  twentyFourHoursAfter: string;
  now: string;
}

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const bookingId = params.bookingId as string;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [availability, setAvailability] = useState<ChatAvailability | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUserId = session?.user?.id || null;

  useEffect(() => {
    fetchBooking();
    fetchAvailability();
    fetchMessages();
    // Poll for new messages every 3 seconds
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [bookingId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchBooking = async () => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`);
      const data = await response.json();
      if (response.ok) {
        setBooking(data.booking);
      }
    } catch (error) {
      console.error("Error fetching booking:", error);
    }
  };

  const fetchAvailability = async () => {
    try {
      const response = await fetch(`/api/chat/availability?bookingId=${bookingId}`);
      const data = await response.json();
      if (response.ok) {
        setAvailability(data);
      }
    } catch (error) {
      console.error("Error fetching availability:", error);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/chat/messages?bookingId=${bookingId}`);
      const data = await response.json();
      if (response.ok) {
        setMessages(data.messages || []);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      setLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const response = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          message: newMessage,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setNewMessage("");
        fetchMessages();
      } else {
        alert(data.error || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-300 border-t-teal-600 mx-auto mb-4"></div>
                <p className="text-slate-600 text-sm">Loading chat...</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!availability?.isAvailable) {
    const appointmentDate = booking ? new Date(booking.date + "T" + booking.startTime) : null;
    const oneHourBefore = availability ? new Date(availability.oneHourBefore) : null;
    const twentyFourHoursAfter = availability ? new Date(availability.twentyFourHoursAfter) : null;
    const now = new Date();

    return (
      <div className="min-h-screen bg-slate-50 p-4 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔒</div>
              <h2 className="text-2xl font-semibold text-slate-900 mb-2">Chat Unavailable</h2>
              <p className="text-slate-600 mb-4">
                Chat is only available during specific time windows:
              </p>
              <div className="bg-slate-50 rounded-lg p-4 mb-6 text-left max-w-md mx-auto">
                <p className="text-sm text-slate-700 mb-2">
                  <span className="font-semibold">⏰ 1 hour before appointment:</span>
                  {oneHourBefore && (
                    <span className="ml-2">
                      {oneHourBefore.toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                </p>
                <p className="text-sm text-slate-700 mb-2">
                  <span className="font-semibold">📅 Appointment time:</span>
                  {appointmentDate && (
                    <span className="ml-2">
                      {appointmentDate.toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                </p>
                <p className="text-sm text-slate-700">
                  <span className="font-semibold">⏱️ 24 hours after appointment:</span>
                  {twentyFourHoursAfter && (
                    <span className="ml-2">
                      {twentyFourHoursAfter.toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                </p>
              </div>
              <Link href={booking ? `/bookings/${bookingId}` : "/my-bookings"}>
                <Button variant="primary">← Back to Booking</Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const otherUser = booking
    ? currentUserId === booking.customerId._id
      ? booking.doctorId
      : booking.customerId
    : null;

  return (
    <div className="min-h-screen bg-slate-50 p-4 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Card className="mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 mb-1">
                💬 Chat with {otherUser?.name || "Doctor"}
              </h1>
              {booking && (
                <p className="text-sm text-slate-600">
                  Appointment: {new Date(booking.date).toLocaleDateString()} at {booking.startTime}
                </p>
              )}
            </div>
            <Link href={booking ? `/bookings/${bookingId}` : "/my-bookings"}>
              <Button variant="outline">← Back</Button>
            </Link>
          </div>
        </Card>

        {/* Messages */}
        <Card className="mb-4" style={{ height: "500px", display: "flex", flexDirection: "column" }}>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">💬</div>
                <p className="text-slate-500">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((message, index) => {
                const isCurrentUser = message.senderId._id === currentUserId;
                const showDateSeparator =
                  index === 0 ||
                  formatDate(messages[index - 1].createdAt) !== formatDate(message.createdAt);

                return (
                  <div key={message._id}>
                    {showDateSeparator && (
                      <div className="text-center my-4">
                        <span className="bg-slate-100 px-3 py-1 rounded-full text-xs text-slate-600">
                          {formatDate(message.createdAt)}
                        </span>
                      </div>
                    )}
                    <div
                      className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg px-4 py-2 ${
                          isCurrentUser
                            ? "bg-teal-600 text-white"
                            : "bg-slate-200 text-slate-900"
                        }`}
                      >
                        {!isCurrentUser && (
                          <p className="text-xs font-semibold mb-1 opacity-80">
                            {message.senderId.name}
                          </p>
                        )}
                        <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                        <p
                          className={`text-xs mt-1 ${
                            isCurrentUser ? "text-teal-100" : "text-slate-500"
                          }`}
                        >
                          {formatTime(message.createdAt)}
                          {isCurrentUser && message.isRead && " ✓✓"}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        </Card>

        {/* Message Input */}
        <Card>
          <form onSubmit={sendMessage} className="flex gap-2">
            <Input
              type="text"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1"
              disabled={sending}
            />
            <Button type="submit" variant="primary" disabled={sending || !newMessage.trim()}>
              {sending ? "Sending..." : "📤 Send"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

