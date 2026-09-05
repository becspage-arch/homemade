# Loom render container — headless CPU Blender for the loom's photoreal base.
#
# This runs the EXACT same render as the local box: the same pinned Blender
# (4.2.9), the same `loom_render.py`, the same scene.json + samples. It is a
# relocation, not a redesign — nothing about the scene, lighting, samples, or
# grade changes. See loom-render/README.md.
#
# Build context is `apps/web/scripts` so the image can COPY the render scripts:
#   docker build -f loom-render/Dockerfile -t homemade/loom-render .
#
# The image carries BOTH renderers — loom_render.py (needlework/embroidery) and
# loom_render_crochet.py (the crochet yarn-fabric recipe). The entrypoint picks
# between them with $LOOM_SCRIPT (default loom_render.py), so existing callers
# are unchanged.
#
# Blender's Cycles renderer is forced to CPU in loom_render.py
# (scene.cycles.device = "CPU") and runs with --background, so no GPU is
# needed and it fits a standard Fargate container.
FROM debian:bookworm-slim

ENV DEBIAN_FRONTEND=noninteractive
# Pin the Blender version to the local box's version so the render matches.
ENV BLENDER_VERSION=4.2.9
ENV BLENDER_URL=https://download.blender.org/release/Blender4.2/blender-4.2.9-linux-x64.tar.xz

# Runtime libraries a headless Blender 4.2 still links against (X11 / GL / SM
# stubs — Cycles CPU never opens a window but the binary loads them), plus the
# AWS CLI (used by the entrypoint to move scene.json in / PNG out via S3) and
# xz to unpack the Blender tarball.
RUN apt-get update && apt-get install -y --no-install-recommends \
      ca-certificates curl xz-utils awscli \
      libx11-6 libxi6 libxxf86vm1 libxfixes3 libxrender1 libxext6 \
      libgl1 libglu1-mesa libsm6 libice6 libxkbcommon0 libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Blender (pinned). Extract to /opt/blender and expose `blender` on PATH.
RUN curl -fsSL "$BLENDER_URL" -o /tmp/blender.tar.xz \
    && mkdir -p /opt/blender \
    && tar -xJf /tmp/blender.tar.xz -C /opt/blender --strip-components=1 \
    && rm /tmp/blender.tar.xz \
    && ln -s /opt/blender/blender /usr/local/bin/blender \
    && blender --version

WORKDIR /opt/loom
# The render scripts are copied UNCHANGED from apps/web/scripts. The image must
# be rebuilt whenever either of them changes so the container stays in lockstep
# with the local render (both paths are in the workflow's trigger list).
COPY loom_render.py /opt/loom/loom_render.py
COPY loom_render_crochet.py /opt/loom/loom_render_crochet.py
COPY loom-render/entrypoint.sh /opt/loom/entrypoint.sh
RUN chmod +x /opt/loom/entrypoint.sh

ENTRYPOINT ["/opt/loom/entrypoint.sh"]
