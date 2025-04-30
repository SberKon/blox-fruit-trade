export interface FruitData {
    name: string;
    values: {
        physical?: {
            value: string;
            demand: string;
            status: string;
        };
        permanent?: {
            value: string;
            demand: string;
            status: string;
        };
    };
    timestamp: string;
}

export interface AllFruitsData {
    fruits: FruitData[];
}