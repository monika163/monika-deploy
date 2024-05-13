import React from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout/Layout";

const PageNotfound = () => {
  return (
    <Layout title={"Page Not Found"}>
      <br></br>
      <div className="pnf" style={{ "text-align": "center" }}>
        <h1 className="pnf-title">404</h1>
        <h2 className="pnf-heading">Oops ! Page Not Found</h2>
        <br></br>
        <Link to="/" className="pnf-btn">
          Go Back
        </Link>
      </div>
    </Layout>
  );
};

export default PageNotfound;
