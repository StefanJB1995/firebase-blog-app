import React from "react";
import { Link } from "react-router-dom";
import { excerpt } from "../utility";

const Card = ({ title, description, imgFile, id }) => {
  return (
    <div className="col-sm-6 col-lg-4 mb-5">
      <div className="related-content card text-decoration-none overflow-hidden h-100">
        <img className="related-img card-img-top" src={imgFile} alt={title} />
        <div className="related-body card-body p-4">
            <h5 className="title text-start py-2">{title}</h5>
            <p className="short-description text-start">{excerpt(description, 10)}</p>
            <div className="d-flex justify-content-between">
                <Link to={`/blog/${id}`} style={{ textDecoration: "none"}}>
                    <span className="text-primary">Read More</span>
                </Link>
                <div>{/* Show like & comment count */}</div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Card;
