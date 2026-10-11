"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";

import { useSetupSummary } from "@/components/builder/use-setup-summary";
import {
  ComboboxField,
  type ComboboxGroup,
} from "@/components/checkout/combobox-field";
import { DateField } from "@/components/checkout/date-field";
import { SiteCredit } from "@/components/site-credit";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BALI_AREAS } from "@/data/bali-areas";
import { DIAL_CODES, flagOf } from "@/data/dial-codes";
import {
  type CheckoutInput,
  checkoutSchema,
  type CheckoutValues,
  createOrder,
  earliestDelivery,
} from "@/lib/checkout";
import { useSetupStore } from "@/store/setup-store";

const AREA_GROUPS: ComboboxGroup[] = BALI_AREAS.map((group) => ({
  heading: group.region,
  options: group.areas.map((area) => ({ value: area, label: area })),
}));

const COUNTRY_GROUPS: ComboboxGroup[] = [
  {
    heading: "Countries",
    options: DIAL_CODES.map((entry) => ({
      value: entry.iso,
      label: `${flagOf(entry.iso)} ${entry.name}`,
      hint: `+${entry.dial}`,
    })),
  },
];

const TEXT_INPUT = "h-10 bg-white text-base sm:text-sm";

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
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutValues, unknown, CheckoutInput>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: {
      fullName: "",
      email: "",
      whatsappCountry: "ID",
      whatsappNumber: "",
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
            className={TEXT_INPUT}
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
            className={TEXT_INPUT}
            {...register("email")}
          />
          <FieldError errors={[errors.email]} />
        </Field>
        <Field data-invalid={errors.whatsappNumber !== undefined}>
          <FieldLabel htmlFor="whatsappNumber">
            WhatsApp{" "}
            <span className="font-normal text-muted-foreground">
              (optional)
            </span>
          </FieldLabel>
          <div className="flex gap-2">
            <Controller
              control={control}
              name="whatsappCountry"
              render={({ field }) => (
                <ComboboxField
                  id="whatsappCountry"
                  ariaLabel="Country code"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  groups={COUNTRY_GROUPS}
                  placeholder="Code"
                  searchPlaceholder="Search a country…"
                  emptyText="No country found."
                  display={(option) =>
                    `${option.label.split(" ")[0] ?? ""} ${option.hint ?? ""}`
                  }
                  className="w-28 shrink-0"
                />
              )}
            />
            <Input
              id="whatsappNumber"
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              placeholder="812 3456 7890"
              aria-invalid={errors.whatsappNumber !== undefined}
              className={TEXT_INPUT}
              {...register("whatsappNumber")}
            />
          </div>
          <FieldError
            errors={[errors.whatsappCountry, errors.whatsappNumber]}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field data-invalid={errors.area !== undefined}>
            <FieldLabel htmlFor="area">Delivery area</FieldLabel>
            <Controller
              control={control}
              name="area"
              render={({ field }) => (
                <ComboboxField
                  id="area"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  groups={AREA_GROUPS}
                  placeholder="Choose an area"
                  searchPlaceholder="Search an area…"
                  emptyText="No area found. Pick “Somewhere else in Bali”."
                  invalid={errors.area !== undefined}
                />
              )}
            />
            <FieldError errors={[errors.area]} />
          </Field>
          <Field data-invalid={errors.deliveryDate !== undefined}>
            <FieldLabel htmlFor="deliveryDate">Delivery date</FieldLabel>
            <Controller
              control={control}
              name="deliveryDate"
              render={({ field }) => (
                <DateField
                  id="deliveryDate"
                  value={field.value}
                  min={earliest}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  invalid={errors.deliveryDate !== undefined}
                />
              )}
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
            className="bg-white text-base sm:text-sm"
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
      <SiteCredit />
    </form>
  );
}
