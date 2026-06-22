import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#F8F7F4',
        dark: '#0A0A0A',
        // 다크 위 카드·이미지 placeholder용 (약간 밝은 다크). 사진 들어가기 전 임시 톤.
        'dark-soft': '#1A1A1A',
        // Hero 전용 배경 — 쿨 라이트 그레이. canvas(#F8F7F4 웜톤)와 구분, RayRayLab 레퍼런스 톤 근사.
        'hero-bg': '#EBEBEB',
        ink: {
          primary: '#111111',
          muted: '#6B6B6B',
          inverse: '#F8F7F4'
        },
        frame: {
          glass: 'rgba(255, 255, 255, 0.06)',
          border: 'rgba(255, 255, 255, 0.18)',
          /* canvas 위 어둡게 보이는 frame 외곽선/chrome — Browser 형태 명시용 */
          outline: 'rgba(17, 17, 17, 0.16)',
          chrome: 'rgba(248, 247, 244, 0.72)',
          divider: 'rgba(17, 17, 17, 0.08)',
          dot: 'rgba(17, 17, 17, 0.22)'
        }
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'var(--font-pretendard)', 'sans-serif'],
        // PP Editorial New 영문 → Pretendard 한글 폴백 (글자별 자동 fallback)
        display: ['var(--font-display)', 'var(--font-pretendard)', 'sans-serif'],
        kr: ['var(--font-pretendard)', 'sans-serif'],
        // IBM Plex Mono 우선 — cross-platform 통일, PP Editorial 에디토리얼 톤 완성
        mono: [
          'var(--font-mono)',
          'var(--font-pretendard)',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'Liberation Mono',
          'Courier New',
          'monospace'
        ]
      },
      fontSize: {
        /* 거대 좌측 타이포 — viewport 가로 80~90% 점유 (스크린샷 비율 기준) */
        'display-xl': ['clamp(72px, 19vw, 360px)', { lineHeight: '0.92', letterSpacing: '-0.04em' }],
        'display-l': ['clamp(56px, 8vw, 128px)', { lineHeight: '0.96', letterSpacing: '-0.03em' }],
        /* About Me 거대 statement — 1920 기준 약 68px, 4줄 wrap, viewport 상하 여백 확보. */
        statement: ['clamp(28px, 3.6vw, 68px)', { lineHeight: '1.12', letterSpacing: '-0.02em' }],
        'display-m': ['clamp(36px, 5vw, 72px)', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        heading: ['clamp(24px, 3vw, 40px)', { lineHeight: '1.15', letterSpacing: '-0.01em' }],
        'body-l': ['clamp(16px, 1.4vw, 20px)', { lineHeight: '1.55' }],
        body: ['clamp(14px, 1.1vw, 16px)', { lineHeight: '1.6' }],
        label: ['12px', { lineHeight: '1.4', letterSpacing: '0.04em' }]
      },
      spacing: {
        'gutter-d': '24px',
        'gutter-t': '20px',
        'gutter-m': '16px',
        'side-d': '64px',
        'side-t': '40px',
        'side-m': '20px'
      },
      maxWidth: {
        container: '1440px'
      },
      minHeight: {
        'screen-dvh': '100dvh'
      },
      transitionTimingFunction: {
        'out-soft': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'in-out-soft': 'cubic-bezier(0.65, 0, 0.35, 1)'
      },
      zIndex: {
        nav: '100',
        cursor: '9999',
        frame: '5',
        overlay: '500'
      },
      animation: {
        'bounce-slow': 'bounce-slow 2s ease-in-out infinite'
      },
      keyframes: {
        'bounce-slow': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(8px)' }
        }
      }
    }
  },
  plugins: []
}

export default config
