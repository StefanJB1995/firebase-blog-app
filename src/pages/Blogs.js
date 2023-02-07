import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import BlogSection from "../components/BlogSection";
import { db } from "../firebase";

const Blogs = () => {
  const [loading, setLoading] = useState(false);
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    getBlogsData();
  }, []);

  const getBlogsData = async () => {
    setLoading(true);
    const blogRef = collection(db, "blogs");
    const first = query(blogRef, orderBy("title"), limit(4));

    const docSnapshot = await getDocs(first);
    setBlogs(docSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    setLoading(false);
  };

  return (
    <div>
      <div className="container">
        <div className="row">
          <div className="blog-heading text-center py-2 mb-4">All Blogs</div>
          {blogs?.map((blog) => (
            <div className="col-md-6">
                <BlogSection {...blog} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Blogs;
