import { FaSearch } from "react-icons/fa";

function NewsForm({ news, setNews, checkNews, loading }) {
  return (
    <>
      <textarea
        placeholder="Paste a news article here..."
        value={news}
        onChange={(e) => setNews(e.target.value)}
      />

      <button onClick={checkNews} disabled={loading}>
        <FaSearch style={{ marginRight: "8px" }} />
        {loading ? "Checking..." : "Check News"}
      </button>
    </>
  );
}

export default NewsForm;