/**
 * @apps-in-toss/web-framework의 isSupported()는 토스 앱 환경 밖(로컬 브라우저 등)에서
 * 호출하면 false를 반환하는 대신 에러를 던져요.
 * 이 헬퍼로 안전하게 지원 여부를 확인하세요.
 */
export function isAitSupported(fn: { isSupported: () => boolean }): boolean {
  try {
    return fn.isSupported()
  } catch {
    return false
  }
}
