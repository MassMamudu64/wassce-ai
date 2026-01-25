

export default function AboutTeam() {
  return (
    <div>
      <header>
        <h1>Meet the WASSCE AI Team</h1>
        <h2>A passionate group dedicated to transforming education through AI.</h2>
      </header>
      <div className="space-y-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">Our Team</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">
            The WASSCE AI team is composed of experienced educators, software developers, and AI specialists who share a common goal: to revolutionize the way students prepare for their exams. With diverse backgrounds in education technology, curriculum development, and artificial intelligence, our team collaborates to create a platform that is both effective and user-friendly.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-gray-50 p-4 text-center">
              <img src="/src/assets/Ai-specialist.png" alt="Team Member 1" className="mx-auto h-24 w-24 rounded-full" />
              <h3 className="mt-2 text-sm font-medium text-slate-950">John Doe</h3>
              <p className="text-xs text-slate-700">AI Specialist</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-gray-50 p-4 text-center">
              <img src="/images/team-member-2.jpg" alt="Team Member 2" className="mx-auto h-24 w-24 rounded-full" />
              <h3 className="mt-2 text-sm font-medium text-slate-950">Jane Smith</h3>
              <p className="text-xs text-slate-700">Software Developer</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-gray-50 p-4 text-center">
              <img src="/images/team-member-3.jpg" alt="Team Member 3" className="mx-auto h-24 w-24 rounded-full" />
              <h3 className="mt-2 text-sm font-medium text-slate-950">Emily Johnson</h3>
              <p className="text-xs text-slate-700">Educator</p>
            </div>
          </div>
        </section>
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">Our Mission</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">
            At WASSCE AI, our mission is to democratize education by providing students with the tools they need to succeed. We believe that every student deserves access to high-quality learning resources, personalized study plans, and real-time feedback. By harnessing the power of AI, we aim to create a supportive learning environment that adapts to each student's unique needs and helps them reach their full potential.
          </p>
        </section>
      </div>
    </div>
  );
}