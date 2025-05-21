import isolatedDeclPlugin from "bun-plugin-isolated-decl";

await Bun.build({
	entrypoints: ["./index.ts"],
	outdir: "./dist",
	target: "bun",
	plugins: [isolatedDeclPlugin()],
});
