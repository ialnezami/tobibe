"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

interface Notification {
  _id: string;
  bookingId: {
    _id: string;
    date: string;
    startTime: string;
    endTime: string;
  };
  type: "late" | "cancel" | "reminder";
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications/appointments");
      const data = await response.json();
      if (response.ok) {
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: "PUT",
      });
      if (response.ok) {
        fetchNotifications();
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "late":
        return "⏰";
      case "cancel":
        return "❌";
      case "reminder":
        return "🔔";
      default:
        return "📢";
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "late":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "cancel":
        return "bg-red-100 text-red-800 border-red-200";
      case "reminder":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
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
                <p className="text-slate-600 text-sm">Loading notifications...</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-screen bg-slate-50 p-4 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-semibold text-slate-900 mb-2">
            🔔 Notifications
          </h1>
          <p className="text-slate-600">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
              : "All caught up!"}
          </p>
        </div>

        {notifications.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-slate-600 mb-4">No notifications yet</p>
              <Link href="/my-bookings">
                <Button variant="outline">View My Bookings</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <Card
                key={notification._id}
                className={`border-2 ${
                  !notification.isRead
                    ? getNotificationColor(notification.type)
                    : "bg-white border-slate-200"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                      <span className="text-xs font-medium uppercase tracking-wide opacity-70">
                        {notification.type}
                      </span>
                      {!notification.isRead && (
                        <span className="text-xs bg-teal-600 text-white px-2 py-0.5 rounded-full">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-slate-900 mb-2">{notification.message}</p>
                    {notification.bookingId && (
                      <p className="text-sm text-slate-600 mb-2">
                        Appointment: {new Date(notification.bookingId.date).toLocaleDateString()} at{" "}
                        {notification.bookingId.startTime}
                      </p>
                    )}
                    <p className="text-xs text-slate-500">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    {!notification.isRead && (
                      <Button
                        variant="outline"
                        className="text-xs px-3 py-1"
                        onClick={() => markAsRead(notification._id)}
                      >
                        Mark Read
                      </Button>
                    )}
                    {notification.bookingId && (
                      <Link href={`/bookings/${notification.bookingId._id}`}>
                        <Button variant="primary" className="text-xs px-3 py-1">
                          View Booking
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

