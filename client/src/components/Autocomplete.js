import React, { useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, InputGroup, FormControl, ListGroup, Card, Alert } from 'react-bootstrap';

function TrieExplorer() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [relatedInfo, setRelatedInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchSuggestions = async (q) => {
    const queryLower = q.toLowerCase();
    if (queryLower.length === 0) {
      setSuggestions([]);
      return;
    }
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/search?q=${queryLower}`);
      setSuggestions(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setLoading(false);
      setError('Error fetching suggestions. Please try again later.');
    }
  };

  const fetchRelatedInfo = async (q) => {
    const queryLower = q.toLowerCase();
    if (queryLower.length === 0) {
      setRelatedInfo('');
      return;
    }
    try {
      setLoading(true);
      const response = await axios.get(`https://en.wikipedia.org/w/api.php`, {
        params: {
          action: 'query',
          format: 'json',
          prop: 'extracts',
          exintro: true,
          explain: '1',
          titles: queryLower,
          origin: '*', 
        },
      });
      const page = Object.values(response.data.query.pages)[0];
      if (page && page.extract) {
        const cleanText = page.extract.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        const words = cleanText.split(' ');
        let truncatedText = words.slice(0, 100).join(' ');

        if (words.length > 100) {
          const lastPeriodIndex = truncatedText.lastIndexOf('.');
          if (lastPeriodIndex !== -1) {
            truncatedText = truncatedText.substring(0, lastPeriodIndex + 1);
          } else {
            truncatedText += '...';
          }
        }

        setRelatedInfo(truncatedText || 'No related information found.');
      } else {
        setRelatedInfo('No related information found.');
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching related info:", error);
      setLoading(false);
      setRelatedInfo('Failed to fetch related information.');
    }
  };

  const onChangeHandler = (e) => {
    const value = e.target.value;
    setQuery(value);
    fetchSuggestions(value);
    fetchRelatedInfo(value);
  };

  const addWordHandler = async (e) => {
    e.preventDefault();
    const queryLower = query.trim().toLowerCase();
    if (queryLower) {
      try {
        await axios.post('http://localhost:5000/api/add-word', { text: queryLower });
        alert(`The word "${queryLower}" has been successfully added.`);
        setQuery('');
        setSuggestions([]);
      } catch (error) {
        console.error("Failed to add word:", error.response.data);
        alert('There was an issue adding the word. Please try again.');
      }
    }
  };

  const deleteWordHandler = async (word) => {
    const wordLower = word.toLowerCase();
    try {
      await axios.delete(`http://localhost:5000/api/delete-word`, { data: { text: wordLower } });
      alert(`The word "${wordLower}" has been successfully deleted.`);
      setSuggestions(suggestions.filter((item) => item.toLowerCase() !== wordLower));
    } catch (error) {
      console.error("Failed to delete word:", error.response.data);
      alert('There was an issue deleting the word. Please try again.');
    }
  };

  const onSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    fetchRelatedInfo(suggestion);
  };

  const onKeyPressHandler = (e) => {
    if (e.key === 'Enter') {
      addWordHandler(e);
    }
  };

  return (
    <Container fluid className="bg-light min-vh-100 p-4">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow-sm">
            <Card.Body>
              <Row className="align-items-center">
                <Col xs={12}>
                  <InputGroup className="mb-3">
                    <FormControl
                      placeholder="Search for a word"
                      value={query}
                      onChange={onChangeHandler}
                      onKeyPress={onKeyPressHandler}
                      size="lg"
                      aria-label="Search for a word"
                    />
                  </InputGroup>
                </Col>
              </Row>
              {loading && <Alert variant="info">Loading...</Alert>}
              {error && <Alert variant="danger">{error}</Alert>}
              <ListGroup className="mb-4">
                {suggestions.map((suggestion, index) => (
                  <ListGroup.Item
                    key={index}
                    className="d-flex justify-content-between align-items-center"
                    onClick={() => onSuggestionClick(suggestion)}
                    style={{ cursor: 'pointer' }}
                  >
                    {suggestion}
                    <span
                      onClick={() => deleteWordHandler(suggestion)}
                      style={{
                        cursor: 'pointer',
                        color: 'red',
                        fontWeight: 'bold',
                      }}
                    >
                      Delete
                    </span>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
        {relatedInfo && (
          <Col md={4} className="d-flex justify-content-center">
            <Card className="shadow-sm w-100">
              <Card.Body>
                <h5>Related Information</h5>
                <p>{relatedInfo}</p>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>
    </Container>
  );
}

export default TrieExplorer;


