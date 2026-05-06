import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Loader2, CheckCircle2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const contactFormSchema = z.object({
  name: z.string().min(1, "Required").max(120),
  company: z.string().max(120).optional().or(z.literal("")),
  email: z.string().email("Valid email required").max(254),
  interestType: z.enum(["platforms", "consulting", "investment", "careers", "other"]),
  message: z.string().min(10, "At least 10 characters").max(4000),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

const MAX_MESSAGE = 4000;

export default function ContactForm() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      company: "",
      email: "",
      interestType: undefined as unknown as ContactFormValues["interestType"],
      message: "",
    },
  });

  const messageValue = form.watch("message") ?? "";

  const mutation = useMutation({
    mutationFn: async (values: ContactFormValues) => {
      const payload = { ...values, company: values.company || null };
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.status === 429) {
        const body = await res.json().catch(() => ({}));
        const err: any = new Error(body.message || "Too many submissions");
        err.code = 429;
        throw err;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || "Failed to submit");
      }
      return res.json();
    },
    onSuccess: () => {
      setSubmitted(true);
      setRateLimited(false);
    },
    onError: (err: any) => {
      if (err?.code === 429) {
        setRateLimited(true);
        return;
      }
      toast({
        title: "Couldn't send your message",
        description:
          "Something went wrong on our end. Please try again, or email info@llt.llc directly.",
        variant: "destructive",
      });
    },
  });

  if (submitted) {
    return (
      <div
        className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8 text-center"
        data-testid="contact-success"
      >
        <CheckCircle2 className="h-12 w-12 text-emerald-300 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-white mb-2">Thanks — we'll be in touch.</h3>
        <p className="text-blue-100">
          A real human at Lamplight will get back to you within 1–2 business days. Check your
          inbox for a confirmation email.
        </p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
        className="space-y-5 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 md:p-8"
        data-testid="contact-form"
      >
        <div className="grid sm:grid-cols-2 gap-5">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-blue-100">Name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Your name"
                    className="bg-white/95 text-slate-900 placeholder:text-slate-400"
                    data-testid="input-contact-name"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-blue-100">Company / Organization</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Optional"
                    className="bg-white/95 text-slate-900 placeholder:text-slate-400"
                    data-testid="input-contact-company"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-blue-100">Email</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  placeholder="you@example.com"
                  className="bg-white/95 text-slate-900 placeholder:text-slate-400"
                  data-testid="input-contact-email"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="interestType"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-blue-100">What are you interested in?</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger
                    className="bg-white/95 text-slate-900"
                    data-testid="select-contact-interest"
                  >
                    <SelectValue placeholder="Choose an option" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="platforms">Platforms</SelectItem>
                  <SelectItem value="consulting">Consulting &amp; AI Adoption</SelectItem>
                  <SelectItem value="investment">Investment or Partnership</SelectItem>
                  <SelectItem value="careers">Careers</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-blue-100">Message</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  rows={6}
                  maxLength={MAX_MESSAGE}
                  placeholder="What's on your mind?"
                  className="bg-white/95 text-slate-900 placeholder:text-slate-400"
                  data-testid="textarea-contact-message"
                />
              </FormControl>
              <div className="flex justify-between items-center">
                <FormMessage />
                <span className="text-xs text-blue-200/80 ml-auto">
                  {messageValue.length} / {MAX_MESSAGE}
                </span>
              </div>
            </FormItem>
          )}
        />

        {rateLimited && (
          <div
            className="text-amber-200 bg-amber-500/10 border border-amber-300/30 rounded-md p-3 text-sm"
            data-testid="contact-rate-limit"
          >
            Too many submissions, please try again in a bit.
          </div>
        )}

        <Button
          type="submit"
          size="lg"
          disabled={mutation.isPending}
          className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white text-lg py-6 shadow-xl shadow-blue-500/40 hover:shadow-2xl hover:shadow-blue-500/60 transition-all duration-300 disabled:opacity-70"
          data-testid="button-contact-submit"
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Sending…
            </>
          ) : (
            "Send Message"
          )}
        </Button>
      </form>
    </Form>
  );
}
