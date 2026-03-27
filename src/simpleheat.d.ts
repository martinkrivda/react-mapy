declare module 'simpleheat' {
  interface SimpleHeatInstance {
    clear(): this;
    data(points: Array<[x: number, y: number, intensity: number]>): this;
    draw(minOpacity?: number): this;
    gradient(stops: Record<number, string>): this;
    max(maximum: number): this;
    radius(radius: number, blur?: number): this;
    resize(): this;
  }

  export default function simpleheat(canvas: HTMLCanvasElement): SimpleHeatInstance;
}
