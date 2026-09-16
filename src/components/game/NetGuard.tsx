import { Button } from "@/components/ui/button";
import { Component, type ErrorInfo, type ReactNode } from "react";

export class NetGuard extends Component<{ children: ReactNode; onBack: () => void }, { msg: string | null }> {
  state: { msg: string | null } = { msg: null };

  static getDerivedStateFromError(err: Error) {
    return { msg: err.message || "The room could not open." };
  }

  componentDidCatch(err: Error, info: ErrorInfo) {
    console.warn("online room", err, info);
  }

  render() {
    if (this.state.msg) {
      return (
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
          <p className="font-display text-2xl">Room closed</p>
          <p className="text-sm text-silver">{this.state.msg}</p>
          <Button variant="gold" onClick={this.props.onBack}>
            Lobby
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
