export type ElementType = string

export type Key = string | null

export type Ref = any

export interface ReactElement {
  $$typeof: symbol
  type: ElementType
  key: Key
  ref: Ref
  // eslint-disable-next-line no-use-before-define
  props: Props
}

export type Props = {
  [key: string]: any
  children?: ReactElement
}
