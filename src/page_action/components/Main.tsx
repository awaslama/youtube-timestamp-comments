import { useContext } from "react";
import {
  Second2CommentsContext,
  SelectedSecondsContext,
} from "../contexts/AppContext";
import { secToTimeStr } from "../entities/Second2Comments";
import { updateTime } from "../modules/ChromeTabs";
import MainSideMenu from "./MainSideMenu";

const timestampPattern = /(?:\d{1,2}:)?\d{1,2}:\d{2}/g;

const uniqueComments = (s2c: Second2Comments): Second2Comments => {
  const commentSet = new Set<string>();
  const result = new Map<number, string[]>() as Second2Comments;

  s2c.forEach((comments, sec) => {
    const newComments = comments.filter((comment) => !commentSet.has(comment));
    newComments.forEach((comment) => {
      commentSet.add(comment);
      result.set(sec, newComments);
    });
  });

  return result;
};

const timestampToSeconds = (timestamp: string): number => {
  const [first, second, third] = timestamp.split(":");
  const [h, m, s] =
    third === undefined
      ? [0, parseInt(first), parseInt(second)]
      : [parseInt(first), parseInt(second), parseInt(third)];
  return h * 3600 + m * 60 + s;
};

const replaceNewline = (text: string): JSX.Element => {
  return text
    .split("\n")
    .map((text_) => <>{text_}</>)
    .reduce((pre, cur) => (
      <>
        {pre}
        <br />
        {cur}
      </>
    ));
};

const replaceTimeLink = (comment: string): JSX.Element => {
  const resultArray: JSX.Element[] = [];

  let lastIndex = 0;
  let currentMatch: RegExpExecArray | null;
  while ((currentMatch = timestampPattern.exec(comment)) !== null) {
    resultArray.push(
      replaceNewline(comment.slice(lastIndex, currentMatch.index))
    );
    const timestamp = currentMatch[0];
    const seconds = timestampToSeconds(timestamp);
    resultArray.push(<a onClick={() => updateTime(seconds)}>{timestamp}</a>);
    lastIndex = timestampPattern.lastIndex;
  }
  resultArray.push(replaceNewline(comment.slice(lastIndex)));

  return resultArray.reduce((pre, cur) => (
    <>
      {pre}
      {cur}
    </>
  ));
};

const s2cToCommentCards = (sec: number, comments: string[]): JSX.Element => {
  return (
    <div className="card" key={sec}>
      <header className="card-header has-background-light">
        <p className="card-header-title">
          <a onClick={() => updateTime(sec)}>{secToTimeStr(sec)}</a>
        </p>
      </header>
      <div className="card-content">
        {comments
          .map((comment) => <div key={comment}>{replaceTimeLink(comment)}</div>)
          .reduce((pre, cur) => (
            <>
              {pre}
              <div className="is-divider"></div>
              {cur}
            </>
          ))}
      </div>
    </div>
  );
};

const Main = () => {
  const s2c = useContext(Second2CommentsContext);
  const [selectedSeconds] = useContext(SelectedSecondsContext);

  const content =
    selectedSeconds === "ALL"
      ? Array.from(uniqueComments(s2c).entries()).map(([sec, comments]) =>
          s2cToCommentCards(sec, comments)
        )
      : s2cToCommentCards(selectedSeconds, s2c.get(selectedSeconds)!);

  return (
    <main className="columns is-mobile is-gapless main-container" role="main">
      <MainSideMenu />
      <section className="column is-8">{content}</section>
    </main>
  );
};

export default Main;
