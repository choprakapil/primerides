"use client";

import CarCard, { CarCardProps } from "./CarCard";

export default function CarSearchCard(props: CarCardProps) {
  return <CarCard {...props} variant="catalog" />;
}

export type { CarCardProps };
