import React from 'react';
import { BadgeCheck, Cpu, ShieldCheck, Zap } from 'lucide-react';

const FooterModern = () => (
    <footer className="mt-12 border-t border-slate-800 bg-slate-950 text-white shadow-[0_-24px_80px_rgba(15,23,42,0.24)] sm:mt-16 md:mt-20">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8 md:py-14">
            <div className="grid gap-8 lg:grid-cols-[1.3fr_0.9fr_0.9fr]">
                <div>
                    <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-blue-600 shadow-lg shadow-blue-500/20">
                            <Zap className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="text-lg font-semibold tracking-tight">Pro Image Toolkit</p>
                            <p className="text-sm text-slate-400">Professional browser-based creative workflow</p>
                        </div>
                    </div>

                    <p className="max-w-xl text-sm leading-7 text-slate-400 sm:text-[15px]">
                        Convert, edit, and export visual content in a cleaner workspace designed for speed, clarity, and reliable browser-first workflows.
                    </p>

                    <div className="mt-6 flex flex-wrap gap-3">
                        <span className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200">
                            <ShieldCheck className="h-4 w-4 text-teal-400" />
                            Secure by design
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200">
                            <Cpu className="h-4 w-4 text-blue-400" />
                            Browser-powered workflow
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200">
                            <BadgeCheck className="h-4 w-4 text-cyan-400" />
                            Export-ready output
                        </span>
                    </div>
                </div>

                <div>
                    <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-slate-500">Workspace</p>
                    <div className="space-y-3 text-sm text-slate-300">
                        <p>Image conversion and optimization</p>
                        <p>Document and media export flows</p>
                        <p>Presentation and editor workspace</p>
                    </div>
                </div>

                <div>
                    <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-slate-500">Platform Note</p>
                    <div className="rounded-3xl border border-slate-800 bg-white/5 p-5">
                        <p className="text-sm font-semibold text-slate-100">Local-first processing</p>
                        <p className="mt-2 text-sm leading-6 text-slate-400">
                            Most conversion workflows run directly in the browser for a faster and more private experience.
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-10 flex flex-col gap-3 border-t border-slate-800 pt-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                <p>© 2025 Pro Image Toolkit. All rights reserved.</p>
                <p>Professional UI refresh applied across the website.</p>
            </div>
        </div>
    </footer>
);

export default FooterModern;
