export type Language = 'bg' | 'en'
export interface ViewerState {
  chapter: number
  request: number
  cancel: number
  tour: boolean
  cutaway: boolean
  labels: boolean
  night: boolean
  language: Language
}
export const initialState: ViewerState = {
  chapter: 0,
  request: 0,
  cancel: 0,
  tour: false,
  cutaway: false,
  labels: false,
  night: false,
  language: 'en',
}
export type ViewerAction =
  | { type: 'chapter'; chapter: number }
  | {
      type:
        'reset' | 'manual' | 'tour' | 'advance' | 'cutaway' | 'labels' | 'night'
    }
  | { type: 'language'; language: Language }
export function viewerReducer(
  state: ViewerState,
  action: ViewerAction,
): ViewerState {
  switch (action.type) {
    case 'chapter':
      return {
        ...state,
        chapter: action.chapter,
        request: state.request + 1,
        tour: false,
      }
    case 'reset':
      return { ...state, chapter: 0, request: state.request + 1, tour: false }
    case 'manual':
      return { ...state, tour: false, cancel: state.cancel + 1 }
    case 'tour':
      return {
        ...state,
        tour: !state.tour,
        request: state.request + (state.tour ? 0 : 1),
        cancel: state.cancel + (state.tour ? 1 : 0),
      }
    case 'advance':
      return state.tour
        ? {
            ...state,
            chapter: (state.chapter + 1) % 5,
            request: state.request + 1,
          }
        : state
    case 'language':
      return { ...state, language: action.language }
    default:
      return { ...state, [action.type]: !state[action.type] }
  }
}
