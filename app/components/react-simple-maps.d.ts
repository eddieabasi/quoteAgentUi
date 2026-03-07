declare module "react-simple-maps" {
  import { ComponentType } from "react";

  export interface ComposableMapProps {
    projection?: string;
    projectionConfig?: {
      scale?: number;
      center?: [number, number];
    };
    width?: number;
    height?: number;
    className?: string;
    style?: React.CSSProperties;
    children?: React.ReactNode;
  }

  export interface GeographiesProps {
    geography: string | object;
    children: (data: { geographies: object[] }) => React.ReactNode;
  }

  export interface GeographyProps {
    geography: object;
    children?: (data: { geography: object; path: string }) => React.ReactNode;
    style?: React.CSSProperties;
    className?: string;
    fill?: string;
    stroke?: string;
    onMouseEnter?: (evt: React.MouseEvent, geography: object) => void;
    onMouseLeave?: (evt: React.MouseEvent) => void;
    onClick?: (evt: React.MouseEvent, geography: object) => void;
  }

  export const ComposableMap: ComponentType<ComposableMapProps>;
  export const Geographies: ComponentType<GeographiesProps>;
  export const Geography: ComponentType<GeographyProps>;
}
