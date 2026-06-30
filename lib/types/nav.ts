export interface NavLink {
  label: string
  href: string
  /** true 면 href 이동 대신 외주(CLIENT) 풀스크린 오버레이를 연다 */
  modal?: boolean
}

export interface FooterLink {
  label: string
  url: string
}
