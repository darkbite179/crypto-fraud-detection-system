"""
graph_builder.py — Wallet interaction graph construction & graph-feature extraction.

Builds a NetworkX directed graph from the Elliptic edgelist and computes
per-node structural features:

    • in_degree          — number of incoming edges
    • out_degree         — number of outgoing edges
    • degree_centrality  — normalised degree centrality
    • clustering_coeff   — local clustering coefficient (undirected projection)
"""

import pandas as pd
import numpy as np
import networkx as nx


def build_graph(edgelist_df: pd.DataFrame) -> nx.DiGraph:
    """Construct a directed graph from the edgelist DataFrame.

    Parameters
    ----------
    edgelist_df : pd.DataFrame
        Two columns: ``txId1``, ``txId2`` representing directed edges.

    Returns
    -------
    nx.DiGraph
    """
    G = nx.from_pandas_edgelist(
        edgelist_df,
        source="txId1",
        target="txId2",
        create_using=nx.DiGraph(),
    )
    print(f"[graph_builder] Graph built — {G.number_of_nodes()} nodes, "
          f"{G.number_of_edges()} edges.")
    return G


def extract_graph_features(
    graph: nx.DiGraph,
    node_ids: pd.Series | list | np.ndarray,
) -> pd.DataFrame:
    """Compute graph-structural features for the given node IDs.

    Parameters
    ----------
    graph : nx.DiGraph
        The full wallet interaction graph.
    node_ids : array-like
        Transaction (node) IDs for which to compute features.

    Returns
    -------
    pd.DataFrame
        Indexed by txId with columns:
        ``in_degree``, ``out_degree``, ``degree_centrality``, ``clustering_coeff``.
    """
    centrality = nx.degree_centrality(graph)
    # Clustering on undirected projection (DiGraph clustering is undefined in nx)
    undirected = graph.to_undirected()
    clustering = nx.clustering(undirected)

    records = []
    for nid in node_ids:
        if graph.has_node(nid):
            records.append({
                "txId": nid,
                "in_degree": graph.in_degree(nid),
                "out_degree": graph.out_degree(nid),
                "degree_centrality": centrality.get(nid, 0.0),
                "clustering_coeff": clustering.get(nid, 0.0),
            })
        else:
            # Node not in graph → zeros
            records.append({
                "txId": nid,
                "in_degree": 0,
                "out_degree": 0,
                "degree_centrality": 0.0,
                "clustering_coeff": 0.0,
            })

    graph_features = pd.DataFrame(records)
    print(f"[graph_builder] Extracted graph features for {len(graph_features)} nodes.")
    return graph_features


def update_graph(graph: nx.DiGraph, new_edges: list[tuple]) -> nx.DiGraph:
    """Incrementally add edges to the graph (for real-time prediction).

    Parameters
    ----------
    graph : nx.DiGraph
        Existing graph.
    new_edges : list[tuple]
        List of ``(source, target)`` pairs to add.

    Returns
    -------
    nx.DiGraph
        Updated graph (mutated in place and also returned).
    """
    graph.add_edges_from(new_edges)
    return graph


def get_graph_features_for_single_node(
    graph: nx.DiGraph | None,
    node_id,
) -> dict:
    """Return graph feature dict for a single node (prediction-time helper).

    Parameters
    ----------
    graph : nx.DiGraph or None
    node_id : hashable

    Returns
    -------
    dict with keys: in_degree, out_degree, degree_centrality, clustering_coeff
    """
    defaults = {
        "in_degree": 0,
        "out_degree": 0,
        "degree_centrality": 0.0,
        "clustering_coeff": 0.0,
    }
    if graph is None or not graph.has_node(node_id):
        return defaults

    centrality = nx.degree_centrality(graph)
    clustering = nx.clustering(graph.to_undirected())
    return {
        "in_degree": graph.in_degree(node_id),
        "out_degree": graph.out_degree(node_id),
        "degree_centrality": centrality.get(node_id, 0.0),
        "clustering_coeff": clustering.get(node_id, 0.0),
    }
