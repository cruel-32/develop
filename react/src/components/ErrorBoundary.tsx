import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * 페이지 레벨 안전망. react-live의 Playground는 자체 에러 바운더리로 실행 에러를
 * 잡아 LiveError에 표시하지만, 그 밖에(페이지 자체 버그 등) 어디선가 렌더링 중
 * 예외가 새어나오더라도 사이드바/탑바는 살아있고 콘텐츠 영역만 복구 UI로 대체되게 한다.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return (
        <div className="crash-box">
          <h2>페이지를 표시하는 중 문제가 발생했습니다</h2>
          <p className="error">{this.state.error.message}</p>
          <button type="button" onClick={this.handleReset}>
            다시 시도
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
