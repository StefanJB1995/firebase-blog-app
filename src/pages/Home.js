import {
  collection,
  onSnapshot,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  orderBy,
} from "firebase/firestore";
import { isEmpty, isNull } from "lodash";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import BlogSection from "../components/BlogSection";
import MostPopular from "../components/MostPopular";
import Search from "../components/Search";
import Spinner from "../components/Spinner";
import Tags from "../components/Tags";
import Trending from "../components/Trending";
import { db } from "../firebase";
import { useLocation } from "react-router-dom";
import { async } from "@firebase/util";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const Home = ({ setActive, user }) => {
  const [loading, setLoading] = useState(true);
  const [blogs, setBlogs] = useState([]);
  const [tags, setTags] = useState([]);
  const [search, setSearch] = useState("");
  const [trendings, setTrendings] = useState([]);
  const queryString = useQuery();
  const searchQuery = queryString.get("searchQuery");

  const getTrendingBlogs = async () => {
    const blogRef = collection(db, "blogs");
    const trendQuery = query(blogRef, where("trending", "==", "yes"));
    const querySnapshot = await getDocs(trendQuery);
    let trendBlogs = [];
    querySnapshot.forEach((doc) => {
      trendBlogs.push({ id: doc.id, ...doc.data() });
    });
    setTrendings(trendBlogs);
  };

  useEffect(() => {
    getTrendingBlogs();
    const unsub = onSnapshot(
      collection(db, "blogs"),
      (snapshot) => {
        let list = [];
        let tags = [];
        snapshot.docs.forEach((doc) => {
          tags.push(...doc.get("tags"));
          list.push({ id: doc.id, ...doc.data() });
        });
        const uniqueTags = [...new Set(tags)];
        setTags(uniqueTags);
        setBlogs(list);
        //setBlogs(list.reverse());
        setLoading(false);
        setActive("home");
      },
      (error) => {
        console.log(error);
      }
    );

    return () => {
      unsub();
      getTrendingBlogs();
    };
  }, [setActive]);

  useEffect(() => {
    if (!isNull(searchQuery)) {
      //isNull is from package lodash
      searchBlogs();
    }
  }, [searchQuery]);

  if (loading) {
    return <Spinner />;
  }

  const searchBlogs = async () => {
    const blogRef = collection(db, "blogs");
    const searchTitleQuery = query(blogRef, where("title", "==", searchQuery));
    const titleSnapshot = await getDocs(searchTitleQuery);
    let searchTitleBlogs = [];
    titleSnapshot.forEach((doc) => {
      searchTitleBlogs.push({ id: doc.id, ...doc.data() });
    });
    setBlogs(searchTitleBlogs);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this blog?")) {
      try {
        setLoading(true);
        await deleteDoc(doc(db, "blogs", id));
        toast.success("Image deleted successfully!");
        setLoading(false);
      } catch (err) {
        console.log(err);
      }
    }
  };

  const getBlogs = async () => {
    const blogRef = collection(db, "blogs");
    // const blogsQuery = query(blogRef, orderBy("title"));
    const docSnapshot = await getDocs(blogRef);
    setBlogs(docSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  const handleChange = (e) => {
    const { value } = e.target;
    if (isEmpty(value)) {
      getBlogs();
    }
    setSearch(value);
  };

  // console.log("blogs", blogs);

  return (
    <div className="container-fluid pb-4 pt-4 padding">
      <div className="container padding">
        <div className="row mx-0">
          <Trending blogs={trendings} />
          <div className="col-md-8">
            <BlogSection
              blogs={blogs}
              user={user}
              handleDelete={handleDelete}
            />
          </div>
          <div className="col-md-3">
            <Search search={search} handleChange={handleChange} />
            <Tags tags={tags} />
            <MostPopular blogs={blogs} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
