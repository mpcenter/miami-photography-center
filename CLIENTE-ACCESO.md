# Acceso al panel — Miami Photography Center

## 🔑 Cómo generar el token (lo haces TÚ, una sola vez)

1. Entra a GitHub con tu cuenta → **https://github.com/settings/personal-access-tokens/new**
   (Settings → Developer settings → Fine-grained tokens → Generate new token)
2. Configura:
   - **Token name:** `MPC Panel Cliente`
   - **Expiration:** 1 año (o "No expiration" si no quieres rotarlo; menos seguro)
   - **Repository access:** *Only select repositories* → `miami-photography-center`
   - **Permissions → Repository permissions → Contents:** **Read and write**
     (lo demás déjalo en "No access")
3. **Generate token** → copia el token (empieza por `github_pat_…`).
   ⚠️ Solo se muestra UNA vez. Guárdalo.

> Alternativa "nunca caduca": un **classic token** (Settings → Developer
> settings → Tokens (classic)) con el scope `repo` y expiration "No
> expiration". Más cómodo, pero da acceso más amplio.

## 📤 Cómo dárselo al cliente

Envíale el token por un canal privado (mejor un gestor de contraseñas o
mensaje que se autodestruye; evita email normal). Junto con esto:

---

### Para el cliente — entrar al panel

1. Abre **https://miamiphotographycenter.vercel.app/admin**
2. Pulsa el botón **"Sign In Using Access Token"**
   (NO uses "Sign In with GitHub")
3. Pega el token que te envió Orestes → **Sign In**
4. Verás **"Tienda — Productos"**. Desde ahí puedes:
   - ➕ Agregar un producto nuevo (nombre, precio, foto, descripción…)
   - ✏️ Editar o 🗑️ eliminar los existentes
5. Cada cambio que guardes se publica solo en la web en ~1 minuto.

El navegador recuerda el token: solo lo pegas la primera vez. Si cambias de
computadora o navegador, lo vuelves a pegar.

---

## 🔒 Seguridad (para ti)

- Si el token se filtra o el cliente cambia: ve a
  **https://github.com/settings/tokens** → revoca ese token → genera otro →
  envíaselo de nuevo. El anterior deja de funcionar al instante.
- El token solo puede tocar el contenido del repo `miami-photography-center`
  (no tu cuenta ni otros repos), porque lo limitamos a *Contents* de ese repo.
- Los commits que haga el cliente aparecerán a tu nombre de GitHub (es
  esperado con token compartido).

## ✅ Verificar que funciona

Después de que el cliente entre y edite un producto de prueba:
1. Revisa que aparezca un commit nuevo en
   https://github.com/oreste2b/miami-photography-center/commits/main
2. En ~1 min, el cambio se ve en https://miamiphotographycenter.vercel.app/store
