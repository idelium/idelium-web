export const sidebarCssClasses = [
  'sidebar-show',
  'sidebar-sm-show',
  'sidebar-md-show',
  'sidebar-lg-show',
  'sidebar-xl-show'
]

export const asideMenuCssClasses = [
  'aside-menu-show',
  'aside-menu-sm-show',
  'aside-menu-md-show',
  'aside-menu-lg-show',
  'aside-menu-xl-show'
]

export const validBreakpoints = ['sm', 'md', 'lg', 'xl']

export function checkBreakpoint(breakpoint, list) {
  return list.indexOf(breakpoint) > -1
}

export function isLetter(e) {
  let char = String.fromCharCode(e.keyCode) // Get the character
  if (/^[A-Za-z]+$/.test(char)) return true // Match with regex
  else e.preventDefault() // If not match, don't add to input text
}

export function validateEmail(email) {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return re.test(String(email).toLowerCase())
}
