export default function CTA() {
  return (
    <section className="py-24 bg-gray-900 text-white text-center">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold mb-3">
          Start Making Smarter Purchases Today
        </h2>
        <p className="text-lg opacity-80 mb-8">
          Join thousands of users who are building wealth one decision at a time.
        </p>
        <a
          href="https://chrome.google.com/webstore"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 bg-[--primary] hover:bg-[--primary-hover] text-white px-8 py-4 rounded-lg text-base font-medium transition-colors"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M12 0C8.21 0 4.831 1.757 2.632 4.501l3.953 6.848A5.454 5.454 0 0 1 12 6.545h10.691A12 12 0 0 0 12 0zM1.931 5.47A11.943 11.943 0 0 0 0 12c0 6.012 4.42 10.991 10.189 11.864l3.953-6.847a5.45 5.45 0 0 1-6.865-2.29zm13.342 2.166a5.446 5.446 0 0 1 1.45 7.09l.002.001h-.002l-3.952 6.848a12.014 12.014 0 0 0 9.921-5.778H15.273z" />
          </svg>
          Add to Chrome - It&apos;s Free
        </a>
      </div>
    </section>
  );
}
