import { cn } from "../../utils/cn";

const FormGroup = ({ className, children, ...props }) => {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      {children}
    </div>
  );
};

const FormLabel = ({ className, ...props }) => {
  return (
    <label
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
      {...props}
    />
  );
};

const FormDescription = ({ className, ...props }) => {
  return (
    <p className={cn("text-xs text-muted-foreground", className)} {...props} />
  );
};

const FormMessage = ({ className, children, ...props }) => {
  return (
    <p
      className={cn("text-xs font-medium text-destructive", className)}
      {...props}
    >
      {children}
    </p>
  );
};

export { FormGroup, FormLabel, FormDescription, FormMessage };
