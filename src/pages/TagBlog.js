import { collection, getDocs, query, where } from "firebase/firestore";
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import BlogSection from "../components/BlogSection";
import Spinner from "../components/Spinner";
import { db } from "../firebase";

const TagBlog = () => {
  const [tagBlogs, setTagBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const { tag } = useParams();

  const getTagBlogs = async () => {
    setLoading(true);
    const blogRef = collection(db, "blogs");
    const TagBlogQuery = query(blogRef, where("tags", "array-contains", tag));
    const docSnapshot = await getDocs(TagBlogQuery);
    let tagBlogs = [];
    docSnapshot.forEach((doc) => {
      tagBlogs.push({ id: doc.id, ...doc.data() });
    });
    setTagBlogs(tagBlogs);
    setLoading(false);
  };

  useEffect(() => {
    getTagBlogs();
  }, []);

  if (loading) {
    return <Spinner />;
  }

  return (
    <div>
      <div className="container">
        <div className="row">
          <div className="blog-heading text-center py-2 mb-4">
            Tag: <strong>{tag.toLocaleUpperCase()}</strong>
          </div>
          {tagBlogs.map((item) => (
            <div className="col-md-6">
              <BlogSection key={item.id} {...item} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TagBlog;
