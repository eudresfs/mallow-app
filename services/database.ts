import * as SQLite from 'expo-sqlite';

// --- Tipos de Dados (com user_id) ---
export interface User {
  id: number; // ID é sempre obrigatório após a criação/obtenção
  nome: string;
  email: string;
}

export interface Insumo {
  id: number;
  user_id: number;
  nome: string;
  categoria: string | null;
  unidade_compra: string;
  quantidade_compra: number;
  preco_compra: number;
  data_compra: string | null;
  quantidade_por_embalagem: number | null;
  fornecedor: string | null;
  observacoes: string | null;
}

export interface CustoGlobal {
  id: number;
  user_id: number;
  nome: string;
  tipo: 'Fixo' | 'Variável';
  valor: number;
  ativo: boolean;
}

export interface Produto {
  id: number;
  user_id: number;
  nome: string;
  rendimento: number;
  margem_lucro: number;
  preco_manual: number | null;
  tempo_producao: number | null; // em minutos
}

export interface InsumoProduto {
  produto_id: number;
  insumo_id: number;
  quantidade_usada: number;
}

export interface ProdutoCompleto extends Produto {
  custo_insumos: number;
  custo_fixo_total: number;
  custo_total_receita: number;
  custo_unitario: number;
  preco_final_sugerido: number;
  insumos: (Insumo & { quantidade_usada: number, custo: number })[];
}

// Abre o banco de dados usando a nova API síncrona
const dbPromise = SQLite.openDatabaseAsync('mallow.db');

const getDb = async () => await dbPromise;


// --- Funções de Setup e Usuário ---
export const setupDatabase = async () => {
  const db = await getDb();
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT, 
      nome TEXT, 
      email TEXT UNIQUE
    );
    CREATE TABLE IF NOT EXISTS insumos (
      id INTEGER PRIMARY KEY AUTOINCREMENT, 
      user_id INTEGER, 
      nome TEXT NOT NULL, 
      categoria TEXT, 
      unidade_compra TEXT, 
      quantidade_compra REAL, 
      preco_compra REAL, 
      data_compra TEXT, 
      quantidade_por_embalagem REAL, 
      fornecedor TEXT, 
      observacoes TEXT, 
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS custos_globais (
      id INTEGER PRIMARY KEY AUTOINCREMENT, 
      user_id INTEGER, 
      nome TEXT NOT NULL, 
      tipo TEXT, 
      valor REAL, 
      ativo BOOLEAN, 
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS produtos (
      id INTEGER PRIMARY KEY AUTOINCREMENT, 
      user_id INTEGER, 
      nome TEXT NOT NULL, 
      rendimento REAL, 
      margem_lucro REAL, 
      preco_manual REAL, 
      tempo_producao REAL, 
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS produtos_insumos (
      produto_id INTEGER, 
      insumo_id INTEGER, 
      quantidade_usada REAL, 
      PRIMARY KEY (produto_id, insumo_id),
      FOREIGN KEY(produto_id) REFERENCES produtos(id) ON DELETE CASCADE,
      FOREIGN KEY(insumo_id) REFERENCES insumos(id) ON DELETE CASCADE
    );
  `);
};

export const getOrCreateDefaultUser = async (): Promise<User> => {
  const db = await getDb();
  let user = await db.getFirstAsync<User>('SELECT * FROM users WHERE email = ?', ['user@default.com']);
  if (user) {
    return user;
  }
  const result = await db.runAsync('INSERT INTO users (nome, email) VALUES (?, ?)', ['Usuário Padrão', 'user@default.com']);
  const insertedId = result.lastInsertRowId;
  
  const newUser = await db.getFirstAsync<User>('SELECT * FROM users WHERE id = ?', [insertedId]);
  if (!newUser) throw new Error("Falha ao criar ou buscar usuário padrão");
  return newUser;
};

// --- Funções Auxiliares ---
// Converte undefined para null para inserção segura no DB
const sanitize = <T extends object>(obj: T): T => {
  const newObj: any = {};
  for (const key in obj) {
    newObj[key] = (obj as any)[key] === undefined ? null : (obj as any)[key];
  }
  return newObj;
};

// --- CRUD de Insumos ---
export type InsumoData = Omit<Insumo, 'id' | 'user_id'>;
export const createInsumo = async (userId: number, insumo: InsumoData): Promise<number> => {
  const db = await getDb();
  const s = sanitize(insumo);
  const result = await db.runAsync(
    'INSERT INTO insumos (user_id, nome, categoria, unidade_compra, quantidade_compra, preco_compra, data_compra, quantidade_por_embalagem, fornecedor, observacoes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [userId, s.nome, s.categoria, s.unidade_compra, s.quantidade_compra, s.preco_compra, s.data_compra, s.quantidade_por_embalagem, s.fornecedor, s.observacoes]
  );
  return result.lastInsertRowId;
};

export const getInsumos = async (userId: number): Promise<Insumo[]> => {
  const db = await getDb();
  return await db.getAllAsync<Insumo>('SELECT * FROM insumos WHERE user_id = ? ORDER BY nome ASC', [userId]);
};

export const getInsumoById = async (userId: number, id: number): Promise<Insumo | null> => {
  const db = await getDb();
  return await db.getFirstAsync<Insumo>('SELECT * FROM insumos WHERE id = ? AND user_id = ?', [id, userId]);
};

export const updateInsumo = async (userId: number, id: number, insumo: InsumoData): Promise<void> => {
  const db = await getDb();
  const s = sanitize(insumo);
  await db.runAsync(
    'UPDATE insumos SET nome = ?, categoria = ?, unidade_compra = ?, quantidade_compra = ?, preco_compra = ?, data_compra = ?, quantidade_por_embalagem = ?, fornecedor = ?, observacoes = ? WHERE id = ? AND user_id = ?',
    [s.nome, s.categoria, s.unidade_compra, s.quantidade_compra, s.preco_compra, s.data_compra, s.quantidade_por_embalagem, s.fornecedor, s.observacoes, id, userId]
  );
};

export const deleteInsumo = async (userId: number, insumoId: number): Promise<void> => {
  const db = await getDb();
  await db.runAsync('DELETE FROM insumos WHERE id = ? AND user_id = ?', [insumoId, userId]);
};

// --- CRUD de Custos Globais ---
export type CustoGlobalData = Omit<CustoGlobal, 'id' | 'user_id'>;
export const createCustoGlobal = async (userId: number, custo: CustoGlobalData): Promise<number> => {
  const db = await getDb();
  const result = await db.runAsync(
    'INSERT INTO custos_globais (user_id, nome, tipo, valor, ativo) VALUES (?, ?, ?, ?, ?)',
    [userId, custo.nome, custo.tipo, custo.valor, custo.ativo ? 1 : 0]
  );
  return result.lastInsertRowId;
};

export const getCustosGlobais = async (userId: number): Promise<CustoGlobal[]> => {
  const db = await getDb();
  const rows = await db.getAllAsync<any>('SELECT * FROM custos_globais WHERE user_id = ? ORDER BY nome ASC', [userId]);
  return rows.map(row => ({ ...row, ativo: !!row.ativo }));
};

export const getCustoGlobalById = async (userId: number, id: number): Promise<CustoGlobal | null> => {
  const db = await getDb();
  const row = await db.getFirstAsync<any>('SELECT * FROM custos_globais WHERE id = ? AND user_id = ?', [id, userId]);
  if (!row) return null;
  return { ...row, ativo: !!row.ativo };
};

export const updateCustoGlobal = async (userId: number, id: number, custo: CustoGlobalData): Promise<void> => {
  const db = await getDb();
  await db.runAsync(
    'UPDATE custos_globais SET nome = ?, tipo = ?, valor = ?, ativo = ? WHERE id = ? AND user_id = ?',
    [custo.nome, custo.tipo, custo.valor, custo.ativo ? 1 : 0, id, userId]
  );
};

export const deleteCustoGlobal = async (userId: number, id: number): Promise<void> => {
  const db = await getDb();
  await db.runAsync('DELETE FROM custos_globais WHERE id = ? AND user_id = ?', [id, userId]);
};

// --- CRUD de Produtos ---
export type ProdutoData = Omit<Produto, 'id' | 'user_id'>;
export type InsumoProdutoData = Omit<InsumoProduto, 'produto_id'>;

export const createProduto = async (userId: number, produto: ProdutoData, insumos: InsumoProdutoData[]): Promise<number> => {
  const db = await getDb();
  const s = sanitize(produto);
  const result = await db.runAsync(
    'INSERT INTO produtos (user_id, nome, rendimento, margem_lucro, preco_manual, tempo_producao) VALUES (?, ?, ?, ?, ?, ?)',
    [userId, s.nome, s.rendimento, s.margem_lucro, s.preco_manual, s.tempo_producao]
  );
  const produtoId = result.lastInsertRowId;
  if (produtoId > 0) {
    for (const insumo of insumos) {
      await db.runAsync('INSERT INTO produtos_insumos (produto_id, insumo_id, quantidade_usada) VALUES (?, ?, ?)', [produtoId, insumo.insumo_id, insumo.quantidade_usada]);
    }
  }
  return produtoId;
};

export const getProdutos = async (userId: number): Promise<Produto[]> => {
  const db = await getDb();
  return await db.getAllAsync<Produto>('SELECT * FROM produtos WHERE user_id = ? ORDER BY nome ASC', [userId]);
};

export const getProdutoById = async (userId: number, id: number): Promise<{ produto: Produto, insumos: InsumoProduto[] } | null> => {
    const db = await getDb();
    const produto = await db.getFirstAsync<Produto>('SELECT * FROM produtos WHERE id = ? AND user_id = ?', [id, userId]);
    if (!produto) return null;
    const insumos = await db.getAllAsync<InsumoProduto>('SELECT * FROM produtos_insumos WHERE produto_id = ?', [id]);
    return { produto, insumos };
};

export const updateProduto = async (userId: number, id: number, produto: ProdutoData, insumos: InsumoProduto[]): Promise<void> => {
    const db = await getDb();
    const s = sanitize(produto);
    await db.runAsync('UPDATE produtos SET nome = ?, rendimento = ?, margem_lucro = ?, preco_manual = ?, tempo_producao = ? WHERE id = ? AND user_id = ?', [s.nome, s.rendimento, s.margem_lucro, s.preco_manual, s.tempo_producao, id, userId]);
    
    await db.runAsync('DELETE FROM produtos_insumos WHERE produto_id = ?', [id]);
    
    for (const insumo of insumos) {
        await db.runAsync('INSERT INTO produtos_insumos (produto_id, insumo_id, quantidade_usada) VALUES (?, ?, ?)', [id, insumo.insumo_id, insumo.quantidade_usada]);
    }
};

export const deleteProduto = async (userId: number, produtoId: number): Promise<void> => {
  const db = await getDb();
  await db.runAsync('DELETE FROM produtos WHERE id = ? AND user_id = ?', [produtoId, userId]);
};

// --- Lógica de Precificação ---
const HORAS_TRABALHO_MES_PADRAO = 160;

export const getProdutosCompletos = async (userId: number): Promise<ProdutoCompleto[]> => {
    const db = await getDb();
    const [produtos, custosGlobais, insumos, produtosInsumos] = await Promise.all([
        getProdutos(userId),
        getCustosGlobais(userId),
        getInsumos(userId),
        db.getAllAsync<InsumoProduto>('SELECT pi.* FROM produtos_insumos pi JOIN produtos p ON pi.produto_id = p.id WHERE p.user_id = ?', [userId]),
    ]);

    const custosAtivos = custosGlobais.filter(c => c.ativo);
    const totalCustosFixos = custosAtivos.reduce((acc, custo) => acc + custo.valor, 0);
    const custoHora = totalCustosFixos / HORAS_TRABALHO_MES_PADRAO;

    const insumosMap = new Map<number, Insumo>(insumos.map(i => [i.id, i]));

    return produtos.map(produto => {
        const insumosDoProduto = produtosInsumos.filter(pi => pi.produto_id === produto.id);

        let custoTotalInsumos = 0;
        const insumosComCusto = insumosDoProduto.map(pi => {
            const insumo = insumosMap.get(pi.insumo_id);
            if (!insumo) return null;
            if(insumo.quantidade_compra <= 0) return { ...insumo, quantidade_usada: pi.quantidade_usada, custo: 0 };

            const custoUnitarioInsumo = insumo.preco_compra / insumo.quantidade_compra;
            const custoInsumoNaReceita = custoUnitarioInsumo * pi.quantidade_usada;
            custoTotalInsumos += custoInsumoNaReceita;
            return { ...insumo, quantidade_usada: pi.quantidade_usada, custo: custoInsumoNaReceita };
        }).filter((i): i is NonNullable<typeof i> => i !== null);

        const tempoProducaoMin = produto.tempo_producao || 0;
        const custoFixoTotal = (custoHora / 60) * tempoProducaoMin;

        const custoTotalReceita = custoTotalInsumos + custoFixoTotal;
        const custoUnitario = produto.rendimento > 0 ? custoTotalReceita / produto.rendimento : 0;

        const precoSugerido = custoUnitario * (1 + (produto.margem_lucro || 0) / 100);

        return {
            ...produto,
            custo_insumos: custoTotalInsumos,
            custo_fixo_total: custoFixoTotal,
            custo_total_receita: custoTotalReceita,
            custo_unitario: custoUnitario,
            preco_final_sugerido: produto.preco_manual ?? precoSugerido,
            insumos: insumosComCusto,
        };
    }).sort((a, b) => a.nome.localeCompare(b.nome));
};

export const getProdutoCompletoById = async (userId: number, produtoId: number): Promise<ProdutoCompleto | null> => {
    const produtosCompletos = await getProdutosCompletos(userId);
    return produtosCompletos.find(p => p.id === produtoId) || null;
}
