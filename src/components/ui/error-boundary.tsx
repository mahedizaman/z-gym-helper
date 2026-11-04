'use client';

import React, { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
  sectionName?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
  }

  handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="w-full my-6 p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-xl text-center flex flex-col items-center justify-center animate-in fade-in duration-200">
          <div className="w-14 h-14 rounded-2xl bg-tomato-brand/15 text-tomato-brand flex items-center justify-center mb-4">
            <AlertTriangle className="w-7 h-7 stroke-[2.5]" />
          </div>

          <h3 className="font-display font-black text-xl sm:text-2xl uppercase tracking-tight text-foreground">
            সাময়িক ত্রুটি ঘটেছে / Something went wrong
          </h3>

          <p className="mt-2 text-xs sm:text-sm text-muted-foreground max-w-md leading-relaxed">
            {this.props.sectionName
              ? `${this.props.sectionName} লোড করতে সমস্যা হয়েছে। অনুগ্রহ করে পেজটি রিলোড করুন।`
              : 'এই অংশটি প্রদর্শন করতে অপ্রত্যাশিত সমস্যা দেখা দিয়েছে। অনুগ্রহ করে পেজটি রিলোড করুন।'}
            <br />
            <span className="text-[11px] opacity-80">
              An unexpected error occurred while loading this section. Please reload the page to continue.
            </span>
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={this.handleReload}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-lime-brand hover:bg-lime-brand/90 text-ink-base font-display font-black text-xs uppercase tracking-wider transition-transform active:scale-95 shadow-sm cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>পেজ রিলোড করুন / Reload</span>
            </button>

            <button
              type="button"
              onClick={this.handleReset}
              className="px-4 py-2 rounded-full border border-border bg-secondary hover:bg-secondary/80 text-foreground font-semibold text-xs transition-colors cursor-pointer"
            >
              পুনরায় চেষ্টা করুন / Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
