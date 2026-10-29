import { assertKnowledge } from "@/lib/content/validate";
import { dishes, districts, restaurants } from "@/content/knowledge/adapter";

assertKnowledge();

export { dishes, districts, restaurants };

export function getDish(slug: string) {
  return dishes.find((dish) => dish.slug === slug);
}

export function getRestaurant(slug: string) {
  return restaurants.find((restaurant) => restaurant.slug === slug);
}

export function getDistrict(slug: string) {
  return districts.find((district) => district.slug === slug);
}

export function restaurantsForDish(slug: string) {
  return restaurants.filter((restaurant) => restaurant.serves.includes(slug));
}
