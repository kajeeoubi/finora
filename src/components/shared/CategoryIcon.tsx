"use client";

import React from "react";
import {
  Utensils,
  Car,
  ShoppingBag,
  Receipt,
  Gamepad2,
  HeartPulse,
  GraduationCap,
  Package,
  Briefcase,
  Laptop,
  Gift,
  TrendingUp,
  TrendingDown,
  Coins,
  ArrowRightLeft,
  Wallet as WalletIcon,
  HelpCircle,
  CreditCard,
  Banknote,
  PiggyBank,
  DollarSign,
  BadgePercent,
  Landmark,
  Scale,
  Coffee,
  Pizza,
  Beer,
  Wine,
  Apple,
  Cake,
  Bus,
  Plane,
  Fuel,
  Train,
  Bike,
  Ship,
  MapPin,
  ShoppingCart,
  Tag,
  Shirt,
  Film,
  Music,
  Tv,
  Headphones,
  Ticket,
  PartyPopper,
  Smile,
  Dumbbell,
  Activity,
  Pill,
  Stethoscope,
  Home,
  Bed,
  Wrench,
  Sparkles,
  Key,
  Wifi,
  Zap,
  BookOpen,
  Smartphone,
  Building,
  Award,
  Baby,
  Dog,
  Cat,
  Heart,
  Shield,
  Send,
  Calendar,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryIconProps {
  iconName?: string;
  isTransfer?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
  bgColor?: string;
  iconColor?: string;
}

export const ICON_MAP: Record<string, LucideIcon> = {
  Utensils,
  Coffee,
  Pizza,
  Beer,
  Wine,
  Apple,
  Cake,
  Car,
  Bus,
  Plane,
  Fuel,
  Train,
  Bike,
  Ship,
  MapPin,
  ShoppingBag,
  ShoppingCart,
  Package,
  Gift,
  Tag,
  Shirt,
  Receipt,
  Gamepad2,
  Film,
  Music,
  Tv,
  Headphones,
  Ticket,
  PartyPopper,
  Smile,
  HeartPulse,
  Dumbbell,
  Activity,
  Pill,
  Stethoscope,
  GraduationCap,
  BookOpen,
  Briefcase,
  Laptop,
  Smartphone,
  Building,
  Award,
  TrendingUp,
  TrendingDown,
  Coins,
  PiggyBank,
  DollarSign,
  BadgePercent,
  Landmark,
  Scale,
  Home,
  Bed,
  Wrench,
  Sparkles,
  Key,
  Wifi,
  Zap,
  Baby,
  Dog,
  Cat,
  Heart,
  Shield,
  Send,
  Calendar,
  ArrowRightLeft,
  Wallet: WalletIcon,
  CreditCard,
  Banknote,
  HelpCircle,
};

export function CategoryIcon({
  iconName = "Package",
  isTransfer = false,
  className,
  size = "md",
  bgColor,
  iconColor,
}: CategoryIconProps) {
  const IconComponent = isTransfer
    ? ArrowRightLeft
    : ICON_MAP[iconName] || Package;

  const sizeClasses = {
    sm: "h-8 w-8 [&_svg]:h-4 [&_svg]:w-4",
    md: "h-11 w-11 [&_svg]:h-5 [&_svg]:w-5",
    lg: "h-14 w-14 [&_svg]:h-7 [&_svg]:w-7",
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full transition-transform shrink-0",
        sizeClasses[size],
        !bgColor && "bg-[#EFEAFE] text-[#6C4EF5] dark:bg-violet-950/60 dark:text-violet-300",
        className
      )}
      style={bgColor ? { backgroundColor: bgColor } : undefined}
    >
      <IconComponent
        className="shrink-0"
        style={iconColor ? { color: iconColor } : undefined}
      />
    </div>
  );
}
