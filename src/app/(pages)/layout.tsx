import React from "react";
import Header from "@/components/layouts/header";
import Footer from "@/components/layouts/footer";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
};

export default Layout;
