export interface CarouselCard {
  cardID: string;
  title: string;
  description: string;
  cardImage: string;
  externalLink: string;
}

export interface CarouselResponse {
  isValid: boolean;
  errorCode: number;
  error: string | null;
  payload: {
    cards: CarouselCard[];
  };
}
