import {
  collection,
  onSnapshot,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  startAfter,
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

const Home = ({ setActive, user, active }) => {
  const [loading, setLoading] = useState(true);
  const [blogs, setBlogs] = useState([]);
  const [tags, setTags] = useState([]);
  const [search, setSearch] = useState("");
  const [trendings, setTrendings] = useState([]);
  const [lastVisible, setLastVisible] = useState(null);
  const queryString = useQuery();
  const searchQuery = queryString.get("searchQuery");
  const location = useLocation();

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

    setSearch("");

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
        //setBlogs(list);

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
  }, [setActive, active]);

  useEffect(() => {
    getBlogs();
  }, [active]);

  useEffect(() => {
    if (!isNull(searchQuery)) {
      //isNull is from package lodash
      searchBlogs();
    }
  }, [searchQuery]);

  const getBlogs = async () => {
    const blogRef = collection(db, "blogs");
    const firstFour = query(blogRef, orderBy("title"), limit(4));
    // const blogsQuery = query(blogRef, orderBy("title"));
    //const docSnapshot = await getDocs(blogRef);
    const docSnapshot = await getDocs(firstFour);
    setBlogs(docSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    setLastVisible(docSnapshot.doc[docSnapshot.docs.length - 1])
  };

  const updateState = (docSnapshot) => {
    const isCollectionEmpty = docSnapshot.size === 0;
    if(!isCollectionEmpty) {
      const blogsData = docSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }))
      setBlogs((blogs) => [...blogs, ...blogsData]);
      setLastVisible(docSnapshot.docs[docSnapshot.docs.length - 1])
    } else {
      toast.info("No more blogs to display");
    }
  }

  const fetchMore = async () => {
    setLoading(true);
    const blogRef = collection(db, "blogs");
    const nextFour = query(blogRef, orderBy("title"), limit(4), startAfter(lastVisible));
    const docSnapshot = await getDocs(nextFour);
    updateState(docSnapshot);
    setLoading(false);
  };


  if (loading) {
    return <Spinner />;
  }

  const searchBlogs = async () => {
    const blogRef = collection(db, "blogs");
    const searchTitleQuery = query(blogRef, where("title", "==", searchQuery));
    const searchTagQuery = query(
      blogRef,
      where("tags", "array-contains", searchQuery)
    );
    const titleSnapshot = await getDocs(searchTitleQuery);
    const tagSnapshot = await getDocs(searchTagQuery);

    let searchTitleBlogs = [];
    let searchTagBlogs = [];

    titleSnapshot.forEach((doc) => {
      searchTitleBlogs.push({ id: doc.id, ...doc.data() });
    });
    tagSnapshot.forEach((doc) => {
      searchTagBlogs.push({ id: doc.id, ...doc.data() });
    });

    const combinedSearchBlogs = searchTitleBlogs.concat(searchTagBlogs);

    setBlogs(combinedSearchBlogs);
    setActive("");
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
            <div className="blog-heading text-start py-2 mb-4">Daily Blogs</div>
            {blogs.length === 0 && location.pathname !== "/" && (
              <>
                <h4>
                  No Blog Found with this search keyword:{" "}
                  <strong>{searchQuery}</strong>
                </h4>
              </>
            )}
            <BlogSection
              blogs={blogs}
              user={user}
              handleDelete={handleDelete}
            />
            <button className="btn btn-primary" onClick={fetchMore}>
              Load More
            </button>
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
