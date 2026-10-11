"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { useForm } from "react-hook-form";

import { useSetupSummary } from "@/components/builder/use-setup-summary";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  type CheckoutInput,
  checkoutSchema,
  type CheckoutValues,
  createOrder,
  DELIVERY_AREAS,
  earliestDelivery,
} from "@/lib/checkout";
import { useSetupStore } from "@/store/setup-store";

const SELECT =
  "h-10 w-full rounded-lg border border-input bg-white px-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive sm:text-sm";

export function CheckoutForm() {
  const router = useRouter();
  const setup = useSetupStore((state) => state.setup);
  const placeOrder = useSetupStore((state) => state.placeOrder);
  const { arrival } = useSetupSummary();
  const earliest = useMemo(
    () => earliestDelivery(arrival, new Date()),
    [arrival],
  );
  const schema = useMemo(() => checkoutSchema(earliest), [earliest]);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutValues, unknown, CheckoutInput>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: {
      fullName: "",
      email: "",
      whatsapp: "",
      area: "",
      address: "",
      deliveryDate: earliest,
    },
  });
  const onSubmit = (values: CheckoutInput): void => {
    placeOrder(createOrder(values, setup, new Date()));
    router.push("/checkout/success");
  };
  return (
    <form
      noValidate
      onSubmit={(event) => void handleSubmit(onSubmit)(event)}
      className="space-y-5 rounded-2xl border bg-card p-4 shadow-sm"
      aria-label="Delivery details"
    >
      <div>
        <h2 className="text-base font-semibold">Where should we bring it?</h2>
        <p className="text-sm text-muted-foreground">
          monis.rent then confirms availability and the delivery fee.
        </p>
      </div>
      <FieldGroup>
        <Field data-invalid={errors.fullName !== undefined}>
          <FieldLabel htmlFor="fullName">Full name</FieldLabel>
          <Input
            id="fullName"
            autoComplete="name"
            aria-invalid={errors.fullName !== undefined}
            className="h-10 text-base sm:text-sm"
            {...register("fullName")}
          />
          <FieldError errors={[errors.fullName]} />
        </Field>
        <Field data-invalid={errors.email !== undefined}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            aria-invalid={errors.email !== undefined}
            className="h-10 text-base sm:text-sm"
            {...register("email")}
          />
          <FieldError errors={[errors.email]} />
        </Field>
        <Field data-invalid={errors.whatsapp !== undefined}>
          <FieldLabel htmlFor="whatsapp">
            WhatsApp{" "}
            <span className="font-normal text-muted-foreground">
              (optional)
            </span>
          </FieldLabel>
          <Input
            id="whatsapp"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+62 812 3456 7890"
            aria-invalid={errors.whatsapp !== undefined}
            className="h-10 text-base sm:text-sm"
            {...register("whatsapp")}
          />
          <FieldError errors={[errors.whatsapp]} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field data-invalid={errors.area !== undefined}>
            <FieldLabel htmlFor="area">Delivery area</FieldLabel>
            <select
              id="area"
              aria-invalid={errors.area !== undefined}
              className={SELECT}
              {...register("area")}
            >
              <option value="">Choose an area</option>
              {DELIVERY_AREAS.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
            <FieldError errors={[errors.area]} />
          </Field>
          <Field data-invalid={errors.deliveryDate !== undefined}>
            <FieldLabel htmlFor="deliveryDate">Delivery date</FieldLabel>
            <Input
              id="deliveryDate"
              type="date"
              min={earliest}
              aria-invalid={errors.deliveryDate !== undefined}
              className="h-10 text-base sm:text-sm"
              {...register("deliveryDate")}
            />
            <FieldError errors={[errors.deliveryDate]} />
          </Field>
        </div>
        <Field data-invalid={errors.address !== undefined}>
          <FieldLabel htmlFor="address">Address or villa</FieldLabel>
          <Textarea
            id="address"
            rows={3}
            autoComplete="street-address"
            placeholder="Villa name, street, or a Google Maps link"
            aria-invalid={errors.address !== undefined}
            className="text-base sm:text-sm"
            {...register("address")}
          />
          <FieldError errors={[errors.address]} />
        </Field>
      </FieldGroup>
      <div className="space-y-2">
        <Button
          type="submit"
          size="lg"
          className="h-11 w-full"
          disabled={isSubmitting}
        >
          Send rental request
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          No payment is taken: this is a concept demo.
        </p>
      </div>
    </form>
  );
}
