import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export default function SectionContainer({ children }: Props) {
  return (
    <div className="max-w-screen px-4 sm:mx-10  xl:max-w-screen xl:mx-20">
      {children}
    </div>
  );
}
