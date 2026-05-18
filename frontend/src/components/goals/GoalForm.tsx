import React from "react";
import { useForm } from "react-hook-form";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ThrustArea } from "../../types";

const goalSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  uom_type: z.enum(["numeric_min", "numeric_max", "percent_min", "percent_max", "timeline", "zero"] as const),
  target_value: z.number().optional(),
  target_date: z.string().optional(),
  weightage: z.number().min(10, "Minimum weightage is 10").max(100, "Maximum weightage is 100"),
  thrust_area_id: z.number().min(1, "Please select a thrust area"),
});

export type GoalFormValues = z.infer<typeof goalSchema>;

interface GoalFormProps {
  onSubmit: (values: GoalFormValues) => void;
  initialValues?: Partial<GoalFormValues>;
  thrustAreas: ThrustArea[];
  isLoading?: boolean;
  isShared?: boolean;
}

const GoalForm: React.FC<GoalFormProps> = ({ onSubmit, initialValues, thrustAreas, isLoading, isShared }) => {
  const form = useForm<GoalFormValues>({
    resolver: zodResolver(goalSchema),
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

  const uomType = form.watch("uom_type");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                <Select onValueChange={field.onChange} defaultValue={field.value?.toString()} disabled={isShared}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select thrust area" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {thrustAreas.map((ta) => (
                      <SelectItem key={ta.id} value={ta.id.toString()}>
                        {ta.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isShared}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select UoM" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="numeric_min">Numeric (Min is better)</SelectItem>
                    <SelectItem value="numeric_max">Numeric (Max is better)</SelectItem>
                    <SelectItem value="percent_min">Percent (Min is better)</SelectItem>
                    <SelectItem value="percent_max">Percent (Max is better)</SelectItem>
                    <SelectItem value="timeline">Timeline (Date-based)</SelectItem>
                    <SelectItem value="zero">Zero-based (Binary)</SelectItem>
                  </SelectContent>
                </Select>
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
