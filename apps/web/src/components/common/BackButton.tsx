import { IconButton } from "@radix-ui/themes";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { useNavigate } from "react-router-dom";

interface BackButtonProps {
  to?: string | number; 
  [key: string]: any; 
}

export default function BackButton({ to = "/dashboard", ...props }: BackButtonProps) {
  const navigate = useNavigate();

  return (
    <IconButton
      onClick={() => (typeof to === "number" ? navigate(to) : navigate(to))}
      color="gray"
      variant="ghost"
      size="3"
      {...props} // Spread props for easy customization
    >
      <ArrowLeftIcon width="22" height="22" />
    </IconButton>
  );
}