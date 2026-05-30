"use client";

import { useState } from "react";
import type { BookingRecord } from "@/lib/catalog/types";
import { BookingWhatsAppModal } from "@/components/admin/booking-whatsapp-modal";
import { ConfirmModal } from "@/components/admin/confirm-modal";
import { notify } from "@/lib/toast";

type BookingWhatsAppActionsProps = {
  booking: BookingRecord;
  onUpdated?: () => void;
  compact?: boolean;
};

export function BookingWhatsAppActions({ booking, onUpdated, compact }: BookingWhatsAppActionsProps) {
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [showConfirmEnjoyModal, setShowConfirmEnjoyModal] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const canWhatsApp = booking.approvalStatus === "confirmed" && Boolean(booking.customerPhone?.trim());
  const canConfirmEnjoy =
    booking.approvalStatus === "confirmed" && Boolean(booking.customerPhone?.trim());

  const alreadyEnjoyed = Boolean(booking.experienceCompletedAt);

  async function submitConfirmEnjoy() {
    setIsConfirming(true);
    try {
      const response = await fetch(`/api/admin/bookings/${booking.id}/confirm-experience`, {
        method: "POST",
      });
      const payload = (await response.json()) as {
        whatsapp?: { sent?: boolean; error?: string; reason?: string; skipped?: boolean };
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "No se pudo confirmar el disfrute.");
      }

      setShowConfirmEnjoyModal(false);

      if (payload.whatsapp?.sent) {
        notify.success("Disfrute confirmado y WhatsApp de reseña enviado.");
      } else if (payload.whatsapp?.skipped) {
        notify.info(`Disfrute confirmado. WhatsApp: ${payload.whatsapp.reason ?? "no enviado."}`);
      } else {
        notify.error(payload.whatsapp?.error ?? "Disfrute confirmado, pero falló el WhatsApp.");
      }

      onUpdated?.();
    } catch (error) {
      notify.error(error instanceof Error ? error.message : "Error al confirmar disfrute.");
    } finally {
      setIsConfirming(false);
    }
  }

  const btnClass = compact
    ? "rounded-full px-3 py-1 text-xs font-semibold"
    : "rounded-full px-3 py-1.5 text-xs font-semibold";

  return (
    <>
      {canWhatsApp ? (
        <button
          type="button"
          onClick={() => setShowWhatsAppModal(true)}
          className={`${btnClass} bg-green-700 text-white`}
        >
          WhatsApp
        </button>
      ) : null}
      {canConfirmEnjoy ? (
        <button
          type="button"
          disabled={isConfirming}
          onClick={() => setShowConfirmEnjoyModal(true)}
          className={`${btnClass} bg-amber-700 text-white disabled:opacity-60`}
          title={
            alreadyEnjoyed
              ? "Vuelve a marcar disfrute y reenvía invitación a reseña"
              : "Marca que ya disfrutaron el pasadía y pide reseña por WhatsApp"
          }
        >
          {alreadyEnjoyed ? "Reenviar reseña" : "Confirmar disfrute"}
        </button>
      ) : null}

      <BookingWhatsAppModal
        bookingId={booking.id}
        bookingCode={booking.bookingCode}
        customerName={booking.customerName}
        isOpen={showWhatsAppModal}
        onClose={() => setShowWhatsAppModal(false)}
        onSent={onUpdated}
      />

      <ConfirmModal
        isOpen={showConfirmEnjoyModal}
        tone="warning"
        title={alreadyEnjoyed ? "¿Reenviar invitación a reseña?" : "¿Confirmar disfrute del pasadía?"}
        description={
          alreadyEnjoyed
            ? `Se volverá a enviar por WhatsApp el enlace de reseña a ${booking.customerName}.`
            : `¿Confirmas que ${booking.customerName} ya disfrutó el pasadía?`
        }
        detail={
          alreadyEnjoyed
            ? `Tour: ${booking.tourName} · Código ${booking.bookingCode}`
            : `Tour: «${booking.tourName}». Se marcará como completado y se enviará de inmediato el WhatsApp pidiendo la reseña.`
        }
        confirmLabel={alreadyEnjoyed ? "Reenviar WhatsApp" : "Sí, confirmar disfrute"}
        isLoading={isConfirming}
        onClose={() => {
          if (!isConfirming) {
            setShowConfirmEnjoyModal(false);
          }
        }}
        onConfirm={() => void submitConfirmEnjoy()}
      />
    </>
  );
}
