"use client";

import DashboardLayout from "@/components/DashboardLayout";
import {
  Archive,
  CheckCircle,
  Clock,
  Eye,
  Filter,
  Inbox,
  Mail,
  MailOpen,
  MessageSquare,
  RefreshCw,
  Reply,
  Search,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface ContactMessage {
  id: string;
  type: "contact_form" | "artist_application" | "partnership_inquiry" | "waste_supply_request";
  status: "unread" | "read" | "replied" | "archived";
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

const typeConfig = {
  contact_form: { labelKey: "admin.messages.typeContactForm", color: "bg-blue-100 text-blue-700" },
  artist_application: { labelKey: "admin.messages.typeArtistApplication", color: "bg-purple-100 text-purple-700" },
  partnership_inquiry: { labelKey: "admin.messages.typePartnership", color: "bg-green-100 text-green-700" },
  waste_supply_request: { labelKey: "admin.messages.typeWasteSupply", color: "bg-amber-100 text-amber-700" },
};

const statusConfig = {
  unread: { labelKey: "admin.messages.statusUnread", color: "bg-red-100 text-red-700", icon: Mail },
  read: { labelKey: "admin.messages.statusRead", color: "bg-blue-100 text-blue-700", icon: MailOpen },
  replied: { labelKey: "admin.messages.statusReplied", color: "bg-green-100 text-green-700", icon: Reply },
  archived: { labelKey: "admin.messages.statusArchived", color: "bg-gray-100 text-gray-600", icon: Archive },
};

export default function AdminMessagesPage() {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<ContactMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchMessages = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/messages");
      if (!response.ok) throw new Error(t("admin.messages.errorFetch"));
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("admin.messages.errorGeneric"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    let filtered = messages;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.name.toLowerCase().includes(query) ||
          m.email.toLowerCase().includes(query) ||
          m.message.toLowerCase().includes(query) ||
          (m.subject?.toLowerCase().includes(query) ?? false)
      );
    }

    // Apply type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((m) => m.type === typeFilter);
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((m) => m.status === statusFilter);
    }

    setFilteredMessages(filtered);
  }, [messages, searchQuery, typeFilter, statusFilter]);

  const updateMessageStatus = async (id: string, status: ContactMessage["status"]) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/admin/messages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error(t("admin.messages.errorUpdate"));

      // Update local state
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status, updatedAt: new Date().toISOString() } : m))
      );
      if (selectedMessage?.id === id) {
        setSelectedMessage((prev) => (prev ? { ...prev, status } : null));
      }
    } catch (err) {
      console.error("Failed to update message:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const stats = {
    total: messages.length,
    unread: messages.filter((m) => m.status === "unread").length,
    read: messages.filter((m) => m.status === "read").length,
    replied: messages.filter((m) => m.status === "replied").length,
    archived: messages.filter((m) => m.status === "archived").length,
  };

  return (
    <DashboardLayout role="admin" userName="Admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t("admin.messages.title")}</h1>
            <p className="text-gray-500">{t("admin.messages.subtitle")}</p>
          </div>
          <button
            type="button"
            onClick={fetchMessages}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            {t("admin.messages.refresh")}
          </button>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <StatCard label={t("admin.messages.statTotal")} value={stats.total} icon={Inbox} />
          <StatCard label={t("admin.messages.statUnread")} value={stats.unread} icon={Mail} tone="red" />
          <StatCard label={t("admin.messages.statRead")} value={stats.read} icon={MailOpen} tone="blue" />
          <StatCard label={t("admin.messages.statReplied")} value={stats.replied} icon={Reply} tone="green" />
          <StatCard label={t("admin.messages.statArchived")} value={stats.archived} icon={Archive} tone="gray" />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-gray-100">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("admin.messages.searchPlaceholder")}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">{t("admin.messages.allTypes")}</option>
              <option value="contact_form">{t("admin.messages.typeContactForm")}</option>
              <option value="artist_application">{t("admin.messages.typeArtistApplication")}</option>
              <option value="partnership_inquiry">{t("admin.messages.typePartnership")}</option>
              <option value="waste_supply_request">{t("admin.messages.typeWasteSupply")}</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">{t("admin.messages.allStatus")}</option>
              <option value="unread">{t("admin.messages.statusUnread")}</option>
              <option value="read">{t("admin.messages.statusRead")}</option>
              <option value="replied">{t("admin.messages.statusReplied")}</option>
              <option value="archived">{t("admin.messages.statusArchived")}</option>
            </select>
          </div>
        </div>

        {/* Messages List and Detail */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Messages List */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">
                {t("admin.messages.messagesCount", { count: filteredMessages.length })}
              </h2>
            </div>
            <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
              {isLoading ? (
                <div className="p-8 text-center text-gray-500">
                  <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  {t("admin.messages.loading")}
                </div>
              ) : filteredMessages.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>{t("admin.messages.noMessages")}</p>
                </div>
              ) : (
                filteredMessages.map((message) => (
                  <MessageRow
                    key={message.id}
                    message={message}
                    isSelected={selectedMessage?.id === message.id}
                    onClick={() => {
                      setSelectedMessage(message);
                      if (message.status === "unread") {
                        updateMessageStatus(message.id, "read");
                      }
                    }}
                  />
                ))
              )}
            </div>
          </div>

          {/* Message Detail */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            {selectedMessage ? (
              <MessageDetail
                message={selectedMessage}
                onStatusChange={updateMessageStatus}
                onClose={() => setSelectedMessage(null)}
                isUpdating={isUpdating}
              />
            ) : (
              <div className="h-full flex items-center justify-center p-8 text-gray-500">
                <div className="text-center">
                  <Eye className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>{t("admin.messages.selectPrompt")}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone = "teal",
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  tone?: "teal" | "red" | "blue" | "green" | "gray";
}) {
  const colors = {
    teal: "text-teal-600 bg-teal-50",
    red: "text-red-600 bg-red-50",
    blue: "text-blue-600 bg-blue-50",
    green: "text-green-600 bg-green-50",
    gray: "text-gray-600 bg-gray-100",
  };
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors[tone]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{label}</p>
        </div>
      </div>
    </div>
  );
}

function MessageRow({
  message,
  isSelected,
  onClick,
}: {
  message: ContactMessage;
  isSelected: boolean;
  onClick: () => void;
}) {
  const { t } = useTranslation();
  const type = typeConfig[message.type];
  const status = statusConfig[message.status];
  const StatusIcon = status.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
        isSelected ? "bg-teal-50 border-l-4 border-teal-600" : ""
      } ${message.status === "unread" ? "bg-blue-50/50" : ""}`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
            message.status === "unread" ? "bg-red-100" : "bg-gray-100"
          }`}
        >
          <StatusIcon
            className={`w-4 h-4 ${message.status === "unread" ? "text-red-600" : "text-gray-500"}`}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`font-medium text-gray-900 ${message.status === "unread" ? "font-semibold" : ""}`}>
              {message.name}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${type.color}`}>
              {t(type.labelKey)}
            </span>
          </div>
          <p className="text-sm text-gray-600 truncate">{message.subject || message.message}</p>
          <div className="flex items-center gap-2 mt-1">
            <Clock className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-400">
              {new Date(message.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

function MessageDetail({
  message,
  onStatusChange,
  onClose,
  isUpdating,
}: {
  message: ContactMessage;
  onStatusChange: (id: string, status: ContactMessage["status"]) => void;
  onClose: () => void;
  isUpdating: boolean;
}) {
  const { t } = useTranslation();
  const type = typeConfig[message.type];
  const status = statusConfig[message.status];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${type.color}`}>
            {t(type.labelKey)}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
            {t(status.labelKey)}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{message.name}</h3>
          <a href={`mailto:${message.email}`} className="text-sm text-teal-600 hover:underline">
            {message.email}
          </a>
          {message.phone && <p className="text-sm text-gray-500 mt-1">{message.phone}</p>}
        </div>

        {message.subject && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700">{t("admin.messages.subjectLabel")}</p>
            <p className="text-gray-900">{message.subject}</p>
          </div>
        )}

        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">{t("admin.messages.messageLabel")}</p>
          <div className="bg-gray-50 rounded-lg p-4 text-gray-800 whitespace-pre-wrap">
            {message.message}
          </div>
        </div>

        {message.metadata && Object.keys(message.metadata).length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">{t("admin.messages.additionalInfo")}</p>
            <div className="bg-gray-50 rounded-lg p-4">
              {Object.entries(message.metadata).map(([key, value]) => (
                <div key={key} className="flex justify-between py-1">
                  <span className="text-sm text-gray-500 capitalize">{key.replace(/_/g, " ")}</span>
                  <span className="text-sm text-gray-900">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-xs text-gray-400">
          {t("admin.messages.received", { date: new Date(message.createdAt).toLocaleString() })}
          {message.updatedAt !== message.createdAt && (
            <> &middot; {t("admin.messages.updated", { date: new Date(message.updatedAt).toLocaleString() })}</>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex flex-wrap gap-2">
          <a
            href={`mailto:${message.email}?subject=Re: ${message.subject || t("admin.messages.defaultReplySubject")}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700"
          >
            <Reply className="w-4 h-4" />
            {t("admin.messages.replyViaEmail")}
          </a>

          {message.status !== "replied" && (
            <button
              type="button"
              onClick={() => onStatusChange(message.id, "replied")}
              disabled={isUpdating}
              className="inline-flex items-center gap-2 px-4 py-2 border border-green-300 text-green-700 text-sm font-medium rounded-lg hover:bg-green-50 disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              {t("admin.messages.markAsReplied")}
            </button>
          )}

          {message.status !== "archived" && (
            <button
              type="button"
              onClick={() => onStatusChange(message.id, "archived")}
              disabled={isUpdating}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <Archive className="w-4 h-4" />
              {t("admin.messages.archive")}
            </button>
          )}

          {message.status === "archived" && (
            <button
              type="button"
              onClick={() => onStatusChange(message.id, "read")}
              disabled={isUpdating}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <Inbox className="w-4 h-4" />
              {t("admin.messages.moveToInbox")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
