import { forwardRef, HTMLAttributes } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ClickableCardProps extends HTMLAttributes<HTMLDivElement> {
  to?: string;
  onClick?: () => void;
  disabled?: boolean;
}

const ClickableCard = forwardRef<HTMLDivElement, ClickableCardProps>(
  ({ to, onClick, disabled, className, children, ...props }, ref) => {
    const navigate = useNavigate();

    const handleClick = () => {
      if (disabled) return;
      if (onClick) {
        onClick();
      } else if (to) {
        navigate(to);
      }
    };

    const isClickable = !disabled && (onClick || to);

    return (
      <Card
        ref={ref}
        className={cn(
          isClickable && [
            'cursor-pointer',
            'transition-all duration-200',
            'hover:shadow-lg hover:border-primary/30',
            'hover:scale-[1.01]',
            'active:scale-[0.99]',
          ],
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        onClick={handleClick}
        {...props}
      >
        {children}
      </Card>
    );
  }
);

ClickableCard.displayName = 'ClickableCard';

export { ClickableCard };
