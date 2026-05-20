import React from "react";
import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ThrustArea } from "../../types";

const goalSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  uom_type: z.enum(["numeric_min", "numeric_max", "percent_min", "percent_max", "timeline", "zero"] as const),
  target_value: z.coerce.number().optional(),
  target_date: z.string().optional(),
  weightage: z.coerce.number().min(10, "Minimum weightage is 10").max(100, "Maximum weightage is 100"),
  thrust_area_id: z.coerce.number().min(1, "Please select a thrust area"),
});

export type GoalFormValues = {
  title: string;
  uom_type: "numeric_min" | "numeric_max" | "percent_min" | "percent_max" | "timeline" | "zero";
  weightage: number;
  thrust_area_id: number;
  description?: string;
  target_value?: number;
  target_date?: string;
};

interface GoalFormProps {
  onSubmit: (values: GoalFormValues) => void;
  initialValues?: Partial<GoalFormValues>;
  thrustAreas: ThrustArea[];
  isLoading?: boolean;
  isShared?: boolean;
}

const GoalForm: React.FC<GoalFormProps> = ({ onSubmit, initialValues, thrustAreas, isLoading, isShared }) => {
  const form = useForm<GoalFormValues>({
    resolver: zodResolver(goalSchema) as Resolver<GoalFormValues>,
    defaultValues: {
      title: initialValues?.title || "",
      description: initialValues?.description || "",
      uom_type: initialValues?.uom_type || "numeric_min",
      target_value: initialValues?.target_value || 0,
      target_date: initialValues?.target_date || "",
      weightage: initialValues?.weightage || 10,
      thrust_area_id: initialValues?.thrust_area_id || 0,
    },
  });

  React.useEffect(() => {
    if (initialValues) {
      form.reset({
        title: initialValues.title || "",
        description: initialValues.description || "",
        uom_type: initialValues.uom_type || "numeric_min",
        target_value: initialValues.target_value || 0,
        target_date: initialValues.target_date || "",
        weightage: initialValues.weightage || 10,
        thrust_area_id: initialValues.thrust_area_id || 0,
      });
    }
  }, [initialValues, form]);

  const handleFormSubmit = async (values: GoalFormValues) => {
    try {
      const payload = {
        title: values.title,
        description: values.description,
        thrust_area_id: Number(values.thrust_area_id),
        uom_type: values.uom_type,
        weightage: Number(values.weightage),
        ...(values.uom_type === "timeline"
          ? (values.target_date ? { target_date: values.target_date } : {})
          : (values.uom_type !== "zero" ? { target_value: Number(values.target_value) } : {}))
      };

      await onSubmit(payload as GoalFormValues);
      form.reset();
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  const uomType = form.watch("uom_type");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Goal Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Achieve Q1 sales target" {...field} disabled={isShared} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Describe the goal in detail..." {...field} disabled={isShared} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="thrust_area_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Thrust Area</FormLabel>
                <FormControl>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                    value={field.value}
                    disabled={isShared}
                  >
                    <option value="">Select thrust area</option>
                    {thrustAreas.map((ta) => (
                      <option key={ta.id} value={ta.id}>
                        {ta.name}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="uom_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit of Measure (UoM)</FormLabel>
                <FormControl>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    onChange={field.onChange}
                    value={field.value}
                    disabled={isShared}
                  >
                    <option value="numeric_min">Numeric (Min is better)</option>
                    <option value="numeric_max">Numeric (Max is better)</option>
                    <option value="percent_min">Percent (Min is better)</option>
                    <option value="percent_max">Percent (Max is better)</option>
                    <option value="timeline">Timeline (Date-based)</option>
                    <option value="zero">Zero-based (Binary)</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {uomType !== "timeline" && uomType !== "zero" && (
            <FormField
              control={form.control}
              name="target_value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Value</FormLabel>
                  <FormControl>
                    <Input type="number" step="any" {...field} disabled={isShared} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {uomType === "timeline" && (
            <FormField
              control={form.control}
              name="target_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} disabled={isShared} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="weightage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Weightage (%)</FormLabel>
                <FormControl>
                  <Input type="number" min="10" max="100" {...field} />
                </FormControl>
                <FormDescription>Min 10. Total must be 100 on submission.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Goal"}
        </Button>
      </form>
    </Form>
  );
};

export default GoalForm;
