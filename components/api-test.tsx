"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ApiTest() {
  const [status, setStatus] = useState<string>("");
  const [data, setData] = useState<any>(null);

  const testApi = async () => {
    try {
      setStatus("Testando conexão...");
      const response = await fetch("/api/proxy/questions");
      const result = await response.json();

      setStatus(`✅ Conexão bem-sucedida! Status: ${response.status}`);
      setData(result);
    } catch (error) {
      setStatus(`❌ Erro na conexão: ${error}`);
      setData(null);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Teste de Conexão com API</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={testApi}>Testar API</Button>
        <div className="text-sm">
          <strong>Status:</strong> {status}
        </div>
        {data && (
          <div className="text-sm">
            <strong>Dados recebidos:</strong>
            <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
