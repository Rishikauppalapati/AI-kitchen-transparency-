// A 390px-wide phone shape, centred on desktop. On a real phone it fills the screen.
export default function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="stage">
      <div className="phone">{children}</div>
    </div>
  );
}
