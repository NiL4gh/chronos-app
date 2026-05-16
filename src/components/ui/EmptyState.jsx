const EmptyState = ({ icon: Icon, title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center mb-5">
        <Icon size={22} className="text-neutral-600" />
      </div>
      <p className="text-sm font-medium text-neutral-300">{title}</p>
      <p className="text-xs text-neutral-600 mt-1.5 max-w-[260px] leading-relaxed">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
};

export default EmptyState;
