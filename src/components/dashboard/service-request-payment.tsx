"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CreditCard, Loader2} from "lucide-react";

import {
  useCreateBkashPayment,
  useCreateStripePayment,
} from "@/hooks/use-customer-data";

import { Button } from "@/components/ui/button";

interface ServiceRequestPaymentProps {
  serviceRequestId: string;
  status: string;
}

type PaymentProvider = "BKASH" | "STRIPE";

export function ServiceRequestPayment({
  serviceRequestId,
  status,
}: ServiceRequestPaymentProps) {
  const [activeProvider, setActiveProvider] = useState<PaymentProvider | null>(
    null,
  );

  const bkashMutation = useCreateBkashPayment();
  const stripeMutation = useCreateStripePayment();

  const isProcessing = bkashMutation.isPending || stripeMutation.isPending;

  if (status !== "PENDING") {
    return null;
  }

  const handlePayment = async (provider: PaymentProvider) => {
    setActiveProvider(provider);

    try {
      const payload = { serviceRequestId };

      const response =
        provider === "BKASH"
          ? await bkashMutation.mutateAsync(payload)
          : await stripeMutation.mutateAsync(payload);

      const checkoutUrl = response.data.checkoutUrl;

      if (!checkoutUrl) {
        throw new Error("Payment checkout URL was not returned.");
      }

      // Redirect the customer to the payment provider.
      window.location.assign(checkoutUrl);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to initiate payment.",
      );

      setActiveProvider(null);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 border-t pt-3">

      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={isProcessing}
        onClick={() => void handlePayment("STRIPE")}
      >
        {activeProvider === "STRIPE" && isProcessing ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <CreditCard className="size-4" />
        )}
        Pay with Stripe
      </Button>
    </div>
  );
}
