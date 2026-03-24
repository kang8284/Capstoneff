let dbPool;

exports.setPool = (pool) => {
  dbPool = pool;
};

// 전체 세션 조회
exports.getAllSessions = async () => {
  const [results] = await dbPool.query('SELECT * FROM user_session');
  return results;
};

// 세션 생성
exports.createSession = async () => {
  const [result] = await dbPool.query('INSERT INTO user_session () VALUES ()');
  return result;
};

// 세션 삭제
exports.deleteSession = async (session_id) => {
  const [result] = await dbPool.query(
    'DELETE FROM user_session WHERE session_id = ?',
    [session_id]
  );
  return result;
};